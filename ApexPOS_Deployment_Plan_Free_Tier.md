# ApexPOS — Production Deployment Plan (100% Free Tier)

## Table of Contents
1. [Free-Tier Architecture Overview](#1-free-tier-architecture-overview)
2. [Free Services Used](#2-free-services-used)
3. [Prerequisites & Accounts](#3-prerequisites--accounts)
4. [Phase 1 — MongoDB Atlas Free Cluster](#4-phase-1--mongodb-atlas-free-cluster)
5. [Phase 2 — Dockerization](#5-phase-2--dockerization)
6. [Phase 3 — Terraform (AWS Free-Tier Infrastructure)](#6-phase-3--terraform-aws-free-tier-infrastructure)
7. [Phase 4 — k3s Kubernetes Setup](#7-phase-4--k3s-kubernetes-setup)
8. [Phase 5 — Jenkins CI Setup](#8-phase-5--jenkins-ci-setup)
9. [Phase 6 — Argo CD GitOps](#9-phase-6--argo-cd-gitops)
10. [Phase 7 — Frontend Deployment (Vercel Free)](#10-phase-7--frontend-deployment-vercel-free)
11. [Phase 8 — AWS CloudWatch Free Tier Monitoring](#11-phase-8--aws-cloudwatch-free-tier-monitoring)
12. [Phase 9 — DNS & SSL (Free)](#12-phase-9--dns--ssl-free)
13. [Phase 10 — Security Hardening](#13-phase-10--security-hardening)
14. [Environment Variables](#14-environment-variables)
15. [Repository File Structure](#15-repository-file-structure)
16. [Estimated Timeline](#16-estimated-timeline)
17. [Free-Tier Limits & Warnings](#17-free-tier-limits--warnings)

---

## 1. Free-Tier Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USERS / BROWSERS                              │
└───────────────┬───────────────────────────────┬─────────────────────────┘
                │                               │
        ┌───────▼──────────┐           ┌────────▼───────────────┐
        │   VERCEL (Free)  │           │  EC2 t2.micro (Free)   │
        │   Frontend SPA   │           │  ┌───────────────────┐ │
        │   React + Vite   │           │  │  k3s (Kubernetes) │ │
        └──────────────────┘           │  │  ┌─────────────┐  │ │
                                       │  │  │ Backend Pod  │  │ │
                                       │  │  │ Node.js +    │  │ │
                                       │  │  │ Express +    │  │ │
                                       │  │  │ Socket.io    │  │ │
                                       │  │  └─────────────┘  │ │
                                       │  │  Traefik Ingress   │ │
                                       │  └───────────────────┘ │
                                       │                        │
                                       │  Jenkins (same box)    │
                                       │  CloudWatch Agent      │
                                       └────────┬───────────────┘
                                                │
                                    ┌───────────▼───────────┐
                                    │  MongoDB Atlas (Free)  │
                                    │  M0 Cluster — 512MB    │
                                    │  Shared, 3 Node RS     │
                                    └────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
     │  Terraform   │    │     Argo CD  │    │  CloudWatch Free │
     │  (Free OSS)  │    │  (GitOps)    │    │  10 Alarms       │
     └──────────────┘    └──────────────┘    │  5GB Logs        │
                                             └──────────────────┘
```

### Key Design Decisions for Free Tier
| Paid Service | Free Replacement | Savings |
|---|---|---|
| AWS EKS ($73/mo control plane) | **k3s** on EC2 (lightweight K8s) | $73/mo |
| Multiple EC2 instances | **Single t2.micro** running everything | $60+/mo |
| NAT Gateway ($32/mo) | **Public subnet only** (no NAT needed) | $32/mo |
| Application Load Balancer ($22/mo) | **k3s Traefik Ingress** (built-in) | $22/mo |
| MongoDB Atlas M10 ($57/mo) | **M0 Free Tier** (512MB) | $57/mo |
| Vercel Pro ($20/mo) | **Vercel Hobby** (free) | $20/mo |
| Route 53 ($1/mo) | **Freenom / Cloudflare Free** | $1/mo |
| **Total Saved** | | **~$285/mo** |

---

## 2. Free Services Used

| Service | Free Tier Details | Duration |
|---------|------------------|----------|
| **AWS EC2** | 750 hrs/mo of t2.micro (1 vCPU, 1GB RAM) | 12 months |
| **AWS EBS** | 30 GB of gp2/gp3 storage | 12 months |
| **AWS CloudWatch** | 10 custom metrics, 10 alarms, 5GB log ingestion, 3 dashboards | Always free |
| **AWS Data Transfer** | 100 GB/mo outbound | 12 months |
| **MongoDB Atlas M0** | 512 MB storage, shared cluster, 100 max connections | Always free |
| **Vercel Hobby** | 100 GB bandwidth, 100 deployments/day, serverless functions | Always free |
| **Docker Hub** | 1 private repo, unlimited public repos | Always free |
| **k3s** | Lightweight Kubernetes (CNCF certified) | Always free (OSS) |
| **Jenkins** | Open-source CI/CD | Always free (OSS) |
| **Terraform** | Open-source IaC | Always free (OSS) |
| **Argo CD** | Open-source GitOps CD | Always free (OSS) |
| **Let's Encrypt** | Free SSL certificates | Always free |
| **Cloudflare** | Free DNS + CDN + SSL | Always free |

---

## 3. Prerequisites & Accounts

### Accounts to Create (All Free)
| Service | Sign Up URL | Notes |
|---------|-------------|-------|
| **AWS** | https://aws.amazon.com/free | Need credit card (won't be charged if within free tier) |
| **MongoDB Atlas** | https://www.mongodb.com/cloud/atlas/register | Select M0 Free cluster |
| **Vercel** | https://vercel.com/signup | Sign up with GitHub |
| **Docker Hub** | https://hub.docker.com/signup | Free account |
| **GitHub** | Already have | `Ntharusha/ApexPOS` |
| **Cloudflare** | https://dash.cloudflare.com/sign-up | Free DNS + proxy |

### Tools (All Free/OSS)
```bash
# All tools are free and open-source
terraform    # IaC
kubectl      # K8s CLI
docker       # Container runtime
aws-cli      # AWS management
helm         # K8s package manager
argocd       # GitOps CD
```

---

## 4. Phase 1 — MongoDB Atlas Free Cluster

### Steps
1. **Sign up** at https://www.mongodb.com/cloud/atlas/register
2. **Create Free Cluster**:
   - Click "Build a Database"
   - Select **M0 FREE** (Shared)
   - Provider: **AWS**
   - Region: **Mumbai (ap-south-1)** — closest to Sri Lanka
   - Cluster Name: `apexpos-free`
3. **Create Database User**:
   ```
   Username: apexpos_app
   Password: <auto-generate & save>
   Role: Atlas Admin (for M0, all roles are available)
   ```
4. **Network Access**:
   - Click "Network Access" → "Add IP Address"
   - Add `0.0.0.0/0` (Allow from anywhere) — required for free tier since EC2 IPs can change
   - ⚠️ This is acceptable because authentication is enforced by user/password
5. **Get Connection String**:
   ```
   mongodb+srv://apexpos_app:<password>@apexpos-free.xxxxx.mongodb.net/apexpos?retryWrites=true&w=majority
   ```

### M0 Free Tier Limits
| Limit | Value |
|-------|-------|
| Storage | 512 MB |
| RAM | Shared |
| Connections | 100 max |
| Network | No peering/private endpoints |
| Backups | No (use `mongodump` manually) |
| Ops/sec | 100 |

> 💡 **512MB is enough for**: ~50,000 products, ~100,000 sales records, and all other collections for a single-store POS system.

---

## 5. Phase 2 — Dockerization

### 5.1 Backend Dockerfile
Create `ApexPOS_SaaS_Main/server/Dockerfile`:
```dockerfile
# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ---- Production Stage ----
FROM node:20-alpine
WORKDIR /app

# Security: run as non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apexpos -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Remove dev/seed files to reduce image size
RUN rm -f seed.js seedGrocery.js seedProducts.js checkDb.js fixIndex.js

USER apexpos
EXPOSE 5000

# Lightweight health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

CMD ["node", "server.js"]
```

### 5.2 Backend .dockerignore
Create `ApexPOS_SaaS_Main/server/.dockerignore`:
```
node_modules
npm-debug.log
.env
.git
*.md
```

### 5.3 Required Code Change — Environment Variable for API URL
Update `ApexPOS_SaaS_Main/client/src/api/axios.ts` line 4:
```typescript
// Before:
const API_BASE = 'http://localhost:5000/api';

// After:
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### 5.4 Required Code Change — Dynamic CORS Origins
Update `ApexPOS_SaaS_Main/server/server.js`:
```javascript
// Replace the hardcoded CORS origin with environment variable
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173'];

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});

app.use(cors({ origin: ALLOWED_ORIGINS }));
```

### 5.5 Build & Test Docker Image Locally
```bash
cd ApexPOS_SaaS_Main/server
docker build -t apexpos-backend:latest .
docker run -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="test-secret" \
  -e ALLOWED_ORIGINS="http://localhost:5173" \
  apexpos-backend:latest
```

---

## 6. Phase 3 — Terraform (AWS Free-Tier Infrastructure)

### Directory Structure
```
terraform/
├── main.tf              # Root module
├── variables.tf         # Variable definitions
├── outputs.tf           # Output values
├── terraform.tfvars     # Your values (gitignored)
├── userdata.sh          # EC2 bootstrap script
└── modules/
    ├── vpc/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── ec2/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    └── cloudwatch/
        ├── main.tf
        └── variables.tf
```

### 6.1 Root Module (`terraform/main.tf`)
```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Free state storage: local backend (for free tier)
  # For team use, switch to S3 backend (S3 free tier: 5GB)
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "ApexPOS"
      ManagedBy = "Terraform"
    }
  }
}

module "vpc" {
  source      = "./modules/vpc"
  vpc_cidr    = var.vpc_cidr
  environment = var.environment
}

module "ec2" {
  source           = "./modules/ec2"
  public_subnet_id = module.vpc.public_subnet_ids[0]
  security_group_id = module.vpc.server_sg_id
  key_pair_name    = var.key_pair_name
  environment      = var.environment
}

module "cloudwatch" {
  source      = "./modules/cloudwatch"
  instance_id = module.ec2.instance_id
  alert_email = var.alert_email
  aws_region  = var.aws_region
}
```

### 6.2 VPC Module — Free (No NAT Gateway) (`terraform/modules/vpc/main.tf`)
```hcl
# VPC — Free
resource "aws_vpc" "apexpos" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "apexpos-${var.environment}-vpc"
  }
}

# Public Subnet (no private subnets = no NAT Gateway needed = $0)
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.apexpos.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "apexpos-${var.environment}-public-${count.index + 1}"
  }
}

# Internet Gateway — Free
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.apexpos.id
  tags   = { Name = "apexpos-${var.environment}-igw" }
}

# Route Table — Free
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.apexpos.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "apexpos-${var.environment}-public-rt" }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security Group — Free
resource "aws_security_group" "server" {
  name_prefix = "apexpos-server-"
  vpc_id      = aws_vpc.apexpos.id

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_ip]
    description = "SSH from admin"
  }

  # Jenkins Web UI
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Jenkins UI"
  }

  # HTTP (k3s Traefik / Backend)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }

  # Backend API direct (for testing)
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Backend API"
  }

  # k3s API
  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = [var.admin_ip]
    description = "K8s API"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "apexpos-server-sg" }
}

data "aws_availability_zones" "available" {
  state = "available"
}

# Variables
variable "vpc_cidr" {
  type = string
}

variable "environment" {
  type = string
}

variable "admin_ip" {
  type    = string
  default = "0.0.0.0/0"
}

# Outputs
output "vpc_id" {
  value = aws_vpc.apexpos.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "server_sg_id" {
  value = aws_security_group.server.id
}
```

### 6.3 EC2 Module — Free Tier (`terraform/modules/ec2/main.tf`)
```hcl
# EC2 Instance — t2.micro FREE TIER
resource "aws_instance" "server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"   # FREE TIER: 750 hrs/mo
  key_name               = var.key_pair_name
  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [var.security_group_id]

  # FREE TIER: 30 GB gp2/gp3
  root_block_device {
    volume_size = 30       # Max free tier EBS
    volume_type = "gp2"    # Free tier eligible
  }

  # Elastic IP (1 free if attached to running instance)
  associate_public_ip_address = true

  # IAM role for CloudWatch
  iam_instance_profile = aws_iam_instance_profile.server.name

  user_data = file("${path.module}/../../userdata.sh")

  tags = {
    Name = "apexpos-${var.environment}-server"
    Role = "jenkins-k3s-backend"
  }
}

# Elastic IP — Free (1 per running instance)
resource "aws_eip" "server" {
  instance = aws_instance.server.id
  domain   = "vpc"
  tags     = { Name = "apexpos-server-eip" }
}

# IAM Role for CloudWatch Agent — Free
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

# Ubuntu 24.04 LTS AMI — Free
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-*-24.04-amd64-server-*"]
  }
}

# Variables
variable "public_subnet_id" { type = string }
variable "security_group_id" { type = string }
variable "key_pair_name" { type = string }
variable "environment" { type = string }

# Outputs
output "instance_id" {
  value = aws_instance.server.id
}

output "public_ip" {
  value = aws_eip.server.public_ip
}

output "public_dns" {
  value = aws_instance.server.public_dns
}
```

### 6.4 Variables (`terraform/variables.tf`)
```hcl
variable "aws_region" {
  description = "AWS region"
  default     = "ap-south-1"   # Mumbai — closest to Sri Lanka
}

variable "environment" {
  description = "Environment name"
  default     = "production"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  default     = "10.0.0.0/16"
}

variable "key_pair_name" {
  description = "EC2 Key Pair name (create in AWS Console first)"
  type        = string
}

variable "admin_ip" {
  description = "Your IP for SSH access (CIDR format, e.g. 1.2.3.4/32)"
  type        = string
  default     = "0.0.0.0/0"
}

variable "alert_email" {
  description = "Email for CloudWatch alarm notifications"
  type        = string
}
```

### 6.5 Outputs (`terraform/outputs.tf`)
```hcl
output "server_public_ip" {
  description = "Public IP of the ApexPOS server"
  value       = module.ec2.public_ip
}

output "jenkins_url" {
  description = "Jenkins Web UI URL"
  value       = "http://${module.ec2.public_ip}:8080"
}

output "backend_api_url" {
  description = "Backend API URL"
  value       = "http://${module.ec2.public_ip}:5000"
}

output "k8s_api_url" {
  description = "Kubernetes API (k3s)"
  value       = "https://${module.ec2.public_ip}:6443"
}
```

### 6.6 EC2 Bootstrap Script (`terraform/userdata.sh`)
```bash
#!/bin/bash
set -e

# Update system
apt-get update && apt-get upgrade -y

# Create 2GB swap file (t2.micro has only 1GB RAM)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu

# Install k3s (lightweight Kubernetes — uses ~512MB RAM)
curl -sfL https://get.k3s.io | sh -s - \
  --write-kubeconfig-mode 644 \
  --disable traefik \
  --docker

# Wait for k3s to be ready
sleep 10
until kubectl get nodes | grep -q "Ready"; do sleep 5; done

# Install kubectl symlink
ln -sf /usr/local/bin/k3s /usr/local/bin/kubectl

echo "Bootstrap complete!"
```

### 6.7 Terraform Execution
```bash
# 1. Create EC2 Key Pair first (one-time, in AWS Console)
#    EC2 → Key Pairs → Create → "apexpos-key" → Download .pem

# 2. Create terraform.tfvars (DO NOT commit this file)
cat > terraform/terraform.tfvars <<EOF
key_pair_name = "apexpos-key"
admin_ip      = "YOUR_IP/32"
alert_email   = "your@email.com"
EOF

# 3. Initialize & Apply
cd terraform
terraform init
terraform plan
terraform apply

# 4. Note the outputs
# server_public_ip = "x.x.x.x"
# jenkins_url = "http://x.x.x.x:8080"
# backend_api_url = "http://x.x.x.x:5000"
```

---

## 7. Phase 4 — k3s Kubernetes Setup

k3s is installed via Terraform `userdata.sh` bootstrap script. After the EC2 instance is ready:

### 7.1 Initial k3s Configuration (Manual)
```bash
# SSH into the EC2 instance
ssh -i ~/.ssh/apexpos-key.pem ubuntu@<EC2-PUBLIC-IP>

# Verify k3s is running
sudo k3s kubectl get nodes

# Copy kubeconfig for kubectl usage
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown ubuntu:ubuntu ~/.kube/config
chmod 600 ~/.kube/config

# Verify connection
kubectl get nodes
```

### 7.2 Install Nginx Ingress Controller (Lighter than Traefik)
```bash
# Install nginx ingress for k3s
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.0/deploy/static/provider/baremetal/deploy.yaml

# Wait for ingress to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

### 7.3 Install Argo CD (GitOps CD Tool)
```bash
# Create argocd namespace
kubectl create namespace argocd

# Install Argo CD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl wait --namespace argocd \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/name=argocd-server \
  --timeout=180s

# Expose Argo CD via NodePort (port 30080)
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort", "ports": [{"port": 80, "targetPort": 8080, "nodePort": 30080}]}}'
```

### 7.4 Get Argo CD Initial Password
```bash
# Get the default admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo
```

### 7.5 Login to Argo CD
- URL: `http://<EC2-PUBLIC-IP>:30080`
- Username: `admin`
- Password: (from above command)

---

## 8. Phase 5 — Jenkins CI Setup

### 8.1 Install Jenkins via Helm
```bash
# Add Jenkins Helm repo
helm repo add jenkins https://charts.jenkins.io
helm repo update

# Install Jenkins (runs inside k3s)
helm install jenkins jenkins/jenkins \
  --namespace jenkins \
  --create-namespace \
  --set controller.adminUser=admin \
  --set controller.adminPassword=admin123 \
  --set controller.serviceType=NodePort \
  --set controller.serviceNodePort=30081 \
  --set controller.resources.limits.memory=256Mi \
  --set controller.resources.requests.memory=128Mi \
  --set persistence.enabled=false
```

### 8.2 Access Jenkins
- URL: `http://<EC2-PUBLIC-IP>:30081`
- Initial setup will take 1-2 minutes

---

## 9. Phase 6 — Argo CD GitOps

### 9.1 Configure Argo CD Repository
Add your GitHub repo to Argo CD:
```bash
# Get argocd CLI token
argocd_token=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.token}' | base64 -d)

# Login via CLI (run from your local machine with kubectl context)
argocd login <EC2-PUBLIC-IP>:30080 --username admin --password <password> --insecure

# Add your GitHub repo
argocd repo add https://github.com/Ntharusha/ApexPOS.git \
  --username <github-username> \
  --password <github-token>

# Create an app
argocd app create apexpos \
  --repo https://github.com/Ntharusha/ApexPOS.git \
  --path k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace apexpos
```

### 9.2 Kubernetes Manifests Directory
```
k8s/
├── namespace.yml
├── backend/
│   ├── deployment.yml
│   ├── service.yml
│   └── configmap.yml
├── ingress/
│   └── ingress.yml
└── argocd/
    └── application.yml
```

### 9.3 Argo CD Application Manifest (`k8s/argocd/application.yml`)
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: apexpos
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/Ntharusha/ApexPOS.git
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: apexpos
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

---

## 10. Phase 7 — Frontend Deployment (Vercel Free)
| Feature | EKS | k3s |
|---------|-----|-----|
| Cost | $73/mo (control plane) | **$0** (runs on EC2) |
| RAM Usage | N/A (managed) | ~512MB |
| CNCF Certified | Yes | Yes |
| kubectl Compatible | Yes | Yes |
| Production Ready | Yes | Yes (used by Rancher) |
| Ingress | ALB ($22/mo) | Built-in Traefik/Nginx ($0) |

### Directory Structure
```
k8s/
├── namespace.yml
├── backend/
│   ├── deployment.yml
│   ├── service.yml
│   └── configmap.yml
└── ingress/
    └── ingress.yml
```

### 8.1 Namespace (`k8s/namespace.yml`)
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: apexpos
  labels:
    app: apexpos
```

### 8.2 Backend ConfigMap (`k8s/backend/configmap.yml`)
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: apexpos
data:
  PORT: "5000"
  NODE_ENV: "production"
  ALLOWED_ORIGINS: "https://your-app.vercel.app"
```

### 8.3 Backend Secrets (create via kubectl, never commit)
```bash
# Create secrets from command line
kubectl create secret generic backend-secrets \
  --namespace apexpos \
  --from-literal=MONGODB_URI='mongodb+srv://apexpos_app:<pass>@apexpos-free.xxxxx.mongodb.net/apexpos?retryWrites=true&w=majority' \
  --from-literal=JWT_SECRET='$(openssl rand -hex 32)'
```

### 8.4 Backend Deployment (`k8s/backend/deployment.yml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: apexpos-backend
  namespace: apexpos
  labels:
    app: apexpos-backend
spec:
  replicas: 1               # Single replica for free tier (limited RAM)
  selector:
    matchLabels:
      app: apexpos-backend
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: apexpos-backend
    spec:
      containers:
        - name: backend
          image: <your-dockerhub-username>/apexpos-backend:latest
          ports:
            - containerPort: 5000
          envFrom:
            - configMapRef:
                name: backend-config
            - secretRef:
                name: backend-secrets
          resources:
            requests:
              memory: "128Mi"     # Conservative for t2.micro
              cpu: "100m"
            limits:
              memory: "256Mi"     # Hard limit
              cpu: "300m"
          readinessProbe:
            httpGet:
              path: /
              port: 5000
            initialDelaySeconds: 10
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /
              port: 5000
            initialDelaySeconds: 15
            periodSeconds: 20
```

### 8.5 Backend Service (`k8s/backend/service.yml`)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: apexpos-backend-svc
  namespace: apexpos
spec:
  type: NodePort             # NodePort is free (no LoadBalancer cost)
  selector:
    app: apexpos-backend
  ports:
    - name: http
      port: 5000
      targetPort: 5000
      nodePort: 30500        # Accessible at <EC2-IP>:30500
```

### 8.6 Ingress — Nginx (`k8s/ingress/ingress.yml`)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: apexpos-ingress
  namespace: apexpos
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/websocket-services: "apexpos-backend-svc"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.yourdomain.com
      secretName: apexpos-tls
  rules:
    - host: api.yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: apexpos-backend-svc
                port:
                  number: 5000
```

### 8.7 Deploy to k3s
```bash
# SSH into the EC2 instance
ssh -i ~/.ssh/apexpos-key.pem ubuntu@<EC2-PUBLIC-IP>

# Apply manifests
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/backend/configmap.yml
# (create secrets as shown in 8.3)
kubectl apply -f k8s/backend/deployment.yml
kubectl apply -f k8s/backend/service.yml
kubectl apply -f k8s/ingress/ingress.yml

# Verify
kubectl get pods -n apexpos
kubectl get svc -n apexpos
kubectl logs -f deployment/apexpos-backend -n apexpos
```

---

## 9. Phase 6 — Jenkins CI/CD Pipeline

### 9.1 Jenkinsfile (`Jenkinsfile` — in repo root)
```groovy
pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDS = credentials('dockerhub-credentials')
        DOCKER_IMAGE     = '<your-dockerhub-username>/apexpos-backend'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))  // Save disk on free tier
        timeout(time: 20, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Lint') {
            parallel {
                stage('Backend Deps') {
                    steps {
                        dir('ApexPOS_SaaS_Main/server') {
                            sh 'npm ci --production'
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        dir('ApexPOS_SaaS_Main/client') {
                            sh 'npm ci'
                            sh 'npm run lint'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            when { branch 'main' }
            steps {
                dir('ApexPOS_SaaS_Main/server') {
                    sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} ."
                    sh "docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Push to Docker Hub') {
            when { branch 'main' }
            steps {
                sh """
                    echo \${DOCKER_HUB_CREDS_PSW} | docker login -u \${DOCKER_HUB_CREDS_USR} --password-stdin
                    docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                    docker push ${DOCKER_IMAGE}:latest
                """
            }
        }

        stage('Deploy to k3s') {
            when { branch 'main' }
            steps {
                sh """
                    kubectl set image deployment/apexpos-backend \
                        backend=${DOCKER_IMAGE}:${BUILD_NUMBER} \
                        -n apexpos
                    kubectl rollout status deployment/apexpos-backend \
                        -n apexpos --timeout=120s
                """
            }
        }

        stage('Smoke Test') {
            when { branch 'main' }
            steps {
                sh """
                    sleep 10
                    curl -f http://localhost:30500/ || exit 1
                    echo "Backend health check passed"
                """
            }
        }
    }

    post {
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            // Clean up Docker images to save disk (30GB limit on free tier)
            sh 'docker image prune -f || true'
        }
    }
}
```

### 9.2 Jenkins Setup Steps (After Helm Installation)
1. **Access Jenkins**: `http://<EC2-IP>:30081`
2. **Get Initial Password**: `kubectl -n jenkins get secret jenkins -o jsonpath="{.data.jenkins-admin-password}" | base64 -d`
3. **Install Suggested Plugins** + these additional:
   - Docker Pipeline
   - Git / GitHub Integration
   - Pipeline
4. **Add Credentials** (Manage Jenkins → Credentials → Global):
   | ID | Type | Value |
   |---|---|---|
   | `dockerhub-credentials` | Username/Password | Docker Hub login |
5. **Create Pipeline Job**:
   - New Item → "apexpos-pipeline" → Pipeline
   - Pipeline → Definition: "Pipeline script from SCM"
   - SCM: Git → `https://github.com/Ntharusha/ApexPOS.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
6. **Configure GitHub Webhook** (for auto-trigger):
    - GitHub repo → Settings → Webhooks → Add
    - Payload URL: `http://<EC2-IP>:30081/github-webhook/`
    - Content type: `application/json`
    - Events: "Just the push event"

### 9.3 CI/CD Pipeline Flow
```
Push to GitHub → Webhook → Jenkins
    │
    ├── 1. Checkout code
    ├── 2. npm install (parallel: frontend + backend)
    ├── 3. Lint frontend
    ├── 4. Build frontend
    ├── 5. Build Docker image (backend)
    ├── 6. Push image to Docker Hub (free)
    ├── 7. kubectl set image → rolling update on k3s
    └── 8. Smoke test → curl health check
```

---

## 10. Phase 7 — Frontend Deployment (Vercel Free)

### 10.1 Vercel Free Tier Limits
| Feature | Free Limit |
|---------|-----------|
| Deployments | 100/day |
| Bandwidth | 100 GB/mo |
| Build Time | 6000 min/mo |
| Serverless Functions | 100 GB-hrs/mo |
| Team Members | 1 (Hobby) |
| Custom Domains | Unlimited |
| SSL | Automatic |

### 10.2 Setup Steps
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select `Ntharusha/ApexPOS`
4. Configure:
   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `ApexPOS_SaaS_Main/client` |
   | **Framework Preset** | Vite |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
5. **Environment Variables** (Settings → Environment Variables):
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `http://<EC2-PUBLIC-IP>:30500/api` (or `https://api.yourdomain.com/api` with domain) |

### 10.3 Vercel Config File
Create `ApexPOS_SaaS_Main/client/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 10.4 Auto-Deploy
Vercel automatically deploys on every push to `main`. No Jenkins step needed for frontend (but kept in Jenkinsfile as optional for validation).

---

## 11. Phase 8 — AWS CloudWatch Free Tier Monitoring

### 11.1 Free Tier Limits
| Feature | Free Allowance |
|---------|---------------|
| Custom Metrics | 10 |
| Alarms | 10 |
| API Requests | 1,000,000/mo |
| Log Data Ingestion | 5 GB/mo |
| Log Data Storage | 5 GB/mo |
| Dashboards | 3 (up to 50 metrics each) |

### 11.2 CloudWatch Terraform Module (`terraform/modules/cloudwatch/main.tf`)
```hcl
# Log Group — Free (up to 5GB)
resource "aws_cloudwatch_log_group" "apexpos" {
  name              = "/apexpos/server"
  retention_in_days = 7    # Short retention to stay within free tier
  tags              = { Application = "ApexPOS" }
}

# Alarm 1: High CPU (Free — up to 10 alarms)
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "apexpos-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "CPU > 85% for 10 minutes"
  dimensions = {
    InstanceId = var.instance_id
  }
  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]
}

# Alarm 2: High Memory
resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "apexpos-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "mem_used_percent"
  namespace           = "CWAgent"
  period              = 300
  statistic           = "Average"
  threshold           = 90
  alarm_description   = "Memory > 90% for 10 minutes"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# Alarm 3: Disk Usage
resource "aws_cloudwatch_metric_alarm" "high_disk" {
  alarm_name          = "apexpos-high-disk"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "disk_used_percent"
  namespace           = "CWAgent"
  period              = 3600
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "Disk > 85%"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# Alarm 4: Instance Status Check
resource "aws_cloudwatch_metric_alarm" "status_check" {
  alarm_name          = "apexpos-status-check"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "EC2 instance status check failed"
  dimensions = {
    InstanceId = var.instance_id
  }
  alarm_actions = [aws_sns_topic.alerts.arn]
}

# SNS Topic — Free (first 1M publishes)
resource "aws_sns_topic" "alerts" {
  name = "apexpos-alerts"
}

# Email Subscription — Free
resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# Dashboard — Free (up to 3)
resource "aws_cloudwatch_dashboard" "apexpos" {
  dashboard_name = "ApexPOS-Overview"
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0, y = 0
        width  = 12, height = 6
        properties = {
          title   = "CPU Utilization"
          metrics = [["AWS/EC2", "CPUUtilization", "InstanceId", var.instance_id]]
          period  = 300
          stat    = "Average"
          region  = var.aws_region
          view    = "timeSeries"
        }
      },
      {
        type   = "metric"
        x      = 12, y = 0
        width  = 12, height = 6
        properties = {
          title   = "Memory Usage"
          metrics = [["CWAgent", "mem_used_percent"]]
          period  = 300
          stat    = "Average"
          region  = var.aws_region
        }
      },
      {
        type   = "metric"
        x      = 0, y = 6
        width  = 12, height = 6
        properties = {
          title   = "Disk Usage"
          metrics = [["CWAgent", "disk_used_percent", "path", "/"]]
          period  = 3600
          stat    = "Average"
          region  = var.aws_region
        }
      },
      {
        type   = "metric"
        x      = 12, y = 6
        width  = 12, height = 6
        properties = {
          title   = "Network Traffic"
          metrics = [
            ["AWS/EC2", "NetworkIn", "InstanceId", var.instance_id],
            ["AWS/EC2", "NetworkOut", "InstanceId", var.instance_id]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
        }
      }
    ]
  })
}

# Variables
variable "instance_id" { type = string }
variable "alert_email" { type = string }
variable "aws_region" { type = string }
```

### 11.3 CloudWatch Agent Config
Manually install CloudWatch Agent on the EC2 instance:

```bash
# Download and install CloudWatch Agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Create config file at /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
```

```json
{
  "agent": {
    "metrics_collection_interval": 300,
    "run_as_user": "root"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/syslog",
            "log_group_name": "/apexpos/server",
            "log_stream_name": "syslog",
            "retention_in_days": 7
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "CWAgent",
    "metrics_collected": {
      "cpu": {
        "measurement": ["cpu_usage_idle", "cpu_usage_user"],
        "totalcpu": true,
        "metrics_collection_interval": 300
      },
      "disk": {
        "measurement": ["used_percent"],
        "resources": ["/"],
        "metrics_collection_interval": 3600
      },
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 300
      }
    }
  }
}
```

```bash
# Start CloudWatch Agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
```

### 11.4 Monitoring Summary (Within Free Tier)
| What's Monitored | Method | Cost |
|---|---|---|
| CPU Usage | CloudWatch built-in EC2 metric | Free |
| Memory Usage | CloudWatch Agent custom metric (1 of 10 free) | Free |
| Disk Usage | CloudWatch Agent custom metric (2 of 10 free) | Free |
| Instance Health | CloudWatch StatusCheckFailed | Free |
| Email Alerts | SNS → Email | Free |
| Dashboard | CloudWatch Dashboard (1 of 3 free) | Free |
| Application Logs | CloudWatch Logs (< 5GB/mo) | Free |
| MongoDB | Atlas built-in monitoring (M0 includes basic) | Free |
| Frontend | Vercel Analytics (basic, built-in) | Free |

---

## 12. Phase 9 — DNS & SSL (Free)

### Option A: Cloudflare (Recommended — Free)
1. **Sign up** at https://dash.cloudflare.com/sign-up
2. **Add your domain** (if you have one)
3. **DNS Records**:
   | Type | Name | Value | Proxy |
   |------|------|-------|-------|
   | A | `api` | `<EC2-Elastic-IP>` | DNS only (gray cloud) |
   | CNAME | `@` | `cname.vercel-dns.com` | DNS only |
   | CNAME | `www` | `cname.vercel-dns.com` | DNS only |

4. **SSL**: Cloudflare provides free SSL (flexible mode)

### Option B: No Custom Domain (Completely Free)
If you don't have/want a domain:
- **Frontend**: Use Vercel's free subdomain → `apexpos.vercel.app`
- **Backend**: Use EC2 public IP directly → `http://<EC2-IP>:30500`
- **SSL for backend**: Use Let's Encrypt with a free `nip.io` domain:
  ```bash
  # nip.io gives you free DNS based on IP
  # Example: 1.2.3.4.nip.io resolves to 1.2.3.4
  sudo apt install certbot
  sudo certbot certonly --standalone -d <EC2-IP>.nip.io
  ```

### Option C: Free Domain Providers
| Provider | Free Domains | URL |
|----------|-------------|-----|
| Freenom | `.tk`, `.ml`, `.ga`, `.cf` | https://freenom.com |
| DuckDNS | `*.duckdns.org` subdomains | https://www.duckdns.org |
| No-IP | `*.ddns.net` subdomains | https://www.noip.com |
| Afraid.org | Various free subdomains | https://freedns.afraid.org |

### Let's Encrypt SSL (Free)
```bash
# Install cert-manager on k3s for automatic SSL
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your@email.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
EOF
```

---

## 13. Phase 10 — Security Hardening

### Free Security Measures
- [ ] Move `JWT_SECRET` to K8s secrets (remove hardcoded default in `auth.js`)
- [ ] Add `helmet.js` to Express (`npm install helmet` — free)
- [ ] Add `express-rate-limit` for API rate limiting (free)
- [ ] MongoDB Atlas: Keep authentication enabled (default)
- [ ] EC2: Restrict SSH to your IP only via Security Group
- [ ] k3s: Already runs with RBAC enabled by default
- [ ] Docker: Already running as non-root user (Dockerfile)
- [ ] Jenkins: Set up admin user (replace initial password)
- [ ] Rotate JWT_SECRET and DB password periodically
- [ ] Use `.env` files, never commit secrets

### Free Security Tools
| Tool | Purpose | Cost |
|------|---------|------|
| Helmet.js | Express security headers | Free (npm) |
| express-rate-limit | API rate limiting | Free (npm) |
| Let's Encrypt | SSL certificates | Free |
| k3s RBAC | K8s access control | Free (built-in) |
| Docker non-root | Container security | Free |
| Security Groups | Network firewall | Free (AWS) |

---

## 14. Environment Variables

### Backend (K8s ConfigMap + Secrets)
| Variable | Where | Example |
|----------|-------|---------|
| `MONGODB_URI` | K8s Secret | `mongodb+srv://...` |
| `JWT_SECRET` | K8s Secret | `<openssl rand -hex 32>` |
| `PORT` | ConfigMap | `5000` |
| `NODE_ENV` | ConfigMap | `production` |
| `ALLOWED_ORIGINS` | ConfigMap | `https://apexpos.vercel.app` |

### Frontend (Vercel Dashboard)
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `http://<EC2-IP>:30500/api` |

---

## 15. Repository File Structure (New Files to Create)

```
ApexPOS/
├── Jenkinsfile                              # CI/CD pipeline
├── terraform/                               # Infrastructure as Code
│   ├── main.tf                              # Root module
│   ├── variables.tf                         # Variable definitions
│   ├── outputs.tf                           # Output values
│   ├── userdata.sh                          # EC2 bootstrap
│   ├── terraform.tfvars                     # Your values (GITIGNORED)
│   └── modules/
│       ├── vpc/main.tf                      # VPC (free)
│       ├── ec2/main.tf                      # t2.micro (free)
│       └── cloudwatch/main.tf               # Monitoring (free)
├── k8s/                                     # Kubernetes Manifests
│   ├── namespace.yml
│   ├── backend/
│   │   ├── deployment.yml
│   │   ├── service.yml
│   │   └── configmap.yml
│   ├── ingress/
│   │   └── ingress.yml
│   └── argocd/
│       └── application.yml
├── .gitignore                               # Add terraform.tfvars, .env, etc.
└── ApexPOS_SaaS_Main/
    ├── client/
    │   └── vercel.json                      # Vercel config
    └── server/
        ├── Dockerfile                       # Backend container
        └── .dockerignore
```

---

## 16. Estimated Timeline

| Phase | Task | Duration |
|-------|------|----------|
| **Phase 1** | MongoDB Atlas M0 Setup | 0.5 day |
| **Phase 2** | Dockerization + Code Changes | 1 day |
| **Phase 3** | Terraform (VPC, EC2, CloudWatch) | 1–2 days |
| **Phase 4** | k3s Setup + Nginx Ingress | 0.5 day |
| **Phase 5** | Argo CD + Jenkins (Helm) | 0.5 day |
| **Phase 6** | Jenkins Pipeline | 1 day |
| **Phase 7** | Vercel Frontend | 0.5 day |
| **Phase 8** | CloudWatch Monitoring | 0.5 day |
| **Phase 9** | DNS & SSL | 0.5 day |
| **Phase 10** | Security Hardening | 0.5 day |
| | **Total Estimated** | **~6–7 days** |

---

## 17. Free-Tier Limits & Warnings

### ⚠️ Important Limitations

| Concern | Details | Mitigation |
|---------|---------|------------|
| **t2.micro = 1GB RAM** | Running Jenkins + k3s + backend on 1GB is tight | 2GB swap file added in userdata.sh |
| **AWS Free Tier = 12 months** | EC2 free tier expires after 12 months from signup | After 12 months: ~$8/mo for t2.micro on-demand |
| **MongoDB M0 = 512MB** | Limited storage for a busy POS | Monitor usage; upgrade to M2 ($9/mo) if needed |
| **Single EC2 = No HA** | If the instance goes down, backend goes down | Use CloudWatch alarm to get notified; manually restart |
| **No ALB/NLB** | Using NodePort directly (less production-grade) | Nginx Ingress handles routing for free |
| **Jenkins on same box** | Builds will compete for resources with the app | Limit concurrent builds to 1 in Jenkins config |
| **30GB disk** | Docker images + Jenkins builds fill up fast | Prune Docker images in pipeline `post` block |

### Resource Budget on t2.micro (1GB RAM + 2GB Swap)
| Process | Est. RAM |
|---------|----------|
| OS + System | ~150 MB |
| k3s (control plane + kubelet) | ~400 MB |
| Node.js Backend (1 pod) | ~150 MB |
| Jenkins (idle, 256MB heap) | ~300 MB |
| CloudWatch Agent | ~50 MB |
| **Total** | **~1050 MB** |
| **Available (RAM + Swap)** | **3072 MB** |

> The 2GB swap file provides enough headroom. Jenkins builds will temporarily spike memory but swap handles it. Performance will be slower during builds but functional.

### Tips to Stay Free
1. **Set AWS billing alerts** at $1 threshold → AWS Console → Billing → Budgets
2. **Stop the EC2 instance** when not in use (save burst credits)
3. **Monitor CloudWatch free tier usage** in the AWS Billing dashboard
4. **Keep Docker image count low** — prune regularly
5. **Use `terraform destroy`** if you want to tear everything down
6. **MongoDB**: Run `db.stats()` periodically to check storage usage

---

## Cost Summary

| Item | Monthly Cost |
|------|-------------|
| AWS EC2 (t2.micro) | **$0** (12-month free tier) |
| AWS EBS (30GB gp2) | **$0** (12-month free tier) |
| AWS CloudWatch | **$0** (always free tier) |
| AWS Elastic IP | **$0** (free when attached to running instance) |
| AWS VPC / Security Groups | **$0** (always free) |
| MongoDB Atlas M0 | **$0** (always free) |
| Vercel Hobby | **$0** (always free) |
| Docker Hub (free plan) | **$0** (always free) |
| k3s / Jenkins / Terraform / Argo CD | **$0** (open source) |
| Let's Encrypt SSL | **$0** (always free) |
| Cloudflare DNS | **$0** (always free) |
| **TOTAL** | **$0/month** |

---

## Quick Start Checklist

```
□ 1. Create AWS account (free tier)
□ 2. Create MongoDB Atlas M0 cluster
□ 3. Create Vercel account (link GitHub)
□ 4. Create Docker Hub account
□ 5. Create AWS EC2 Key Pair
□ 6. Run: terraform init && terraform apply
□ 7. SSH into EC2 and configure k3s (setup nginx ingress, Argo CD, Jenkins via Helm)
□ 8. Build & push Docker image
□ 9. Configure Argo CD to sync k8s manifests from GitHub
□ 10. Set up Jenkins pipeline
□ 11. Configure Vercel project
□ 12. Set up DNS & SSL
□ 13. Test end-to-end
□ 14. Set AWS billing alarm at $1
```
