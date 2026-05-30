terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ApexPOS"
      ManagedBy   = "Terraform"
      Environment = var.environment
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

# VPC and Subnet (No NAT Gateway = Free)
resource "aws_vpc" "apexpos" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "apexpos-${var.environment}-vpc" }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.apexpos.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, 0)
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true
  tags = { Name = "apexpos-${var.environment}-public" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.apexpos.id
  tags   = { Name = "apexpos-${var.environment}-igw" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.apexpos.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "apexpos-${var.environment}-public-rt" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Security Group
resource "aws_security_group" "server" {
  name_prefix = "apexpos-server-"
  vpc_id      = aws_vpc.apexpos.id

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_ip]
  }
  # Jenkins
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # HTTP (k3s Ingress)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # HTTPS (k3s Ingress)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # Backend API directly (for testing)
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # k3s API
  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = [var.admin_ip]
  }
  # Argo CD UI (NodePort)
  ingress {
    from_port   = 30080
    to_port     = 30080
    protocol    = "tcp"
    cidr_blocks = [var.admin_ip]
  }
  # Backend NodePort (smoke tests / interim API)
  ingress {
    from_port   = 30500
    to_port     = 30500
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "apexpos-server-sg" }
}

# Ubuntu 24.04 LTS AMI (Free Tier Eligible)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-*-24.04-amd64-server-*"]
  }
}

# IAM Role for CloudWatch Agent
resource "aws_iam_role" "server" {
  name = "apexpos-server-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cloudwatch" {
  role       = aws_iam_role.server.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_instance_profile" "server" {
  name = "apexpos-server-profile"
  role = aws_iam_role.server.name
}

# EC2 Instance - t3.micro (Free Tier Eligible)
resource "aws_instance" "server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  key_name               = var.key_pair_name
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.server.id]
  iam_instance_profile   = aws_iam_instance_profile.server.name

  # Free tier max EBS storage is 30GB gp2/gp3
  root_block_device {
    volume_size = 30
    volume_type = "gp3" 
  }

  user_data = file("${path.module}/userdata.sh")

  tags = {
    Name = "apexpos-${var.environment}-server"
    Role = "k3s-jenkins-argocd"
  }
}

# Elastic IP (Free when attached to a running instance)
resource "aws_eip" "server" {
  instance = aws_instance.server.id
  domain   = "vpc"
  tags     = { Name = "apexpos-server-eip" }
}

# CloudWatch Resources
resource "aws_cloudwatch_log_group" "apexpos" {
  name              = "/apexpos/server"
  retention_in_days = 7
}

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "apexpos-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "CPU usage is high"
  dimensions = {
    InstanceId = aws_instance.server.id
  }
  alarm_actions = [aws_sns_topic.alerts.arn]
}

resource "aws_sns_topic" "alerts" {
  name = "apexpos-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}
