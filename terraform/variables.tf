variable "aws_region" {
  description = "AWS region"
  default     = "ap-south-1" # Mumbai, per plan
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
  description = "Your IP for SSH and K8s API access (CIDR format, e.g., 1.2.3.4/32). Use 0.0.0.0/0 for any."
  type        = string
  default     = "0.0.0.0/0"
}
