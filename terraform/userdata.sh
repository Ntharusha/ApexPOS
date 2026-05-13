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

# Print complete
echo "Basic bootstrap complete! Ready for Ansible configuration."
