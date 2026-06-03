#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

# Ensure system is updated and SSH is working
apt-get update > /dev/null 2>&1
apt-get install -y openssh-server openssh-client > /dev/null 2>&1
systemctl restart ssh

# Swap — required for k3s + Docker on 1GB RAM (t3.micro)
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Docker — Jenkins CI builds on host
curl -fsSL https://get.docker.com | bash > /dev/null 2>&1 || true
usermod -aG docker ubuntu || true

# k3s — single-node Kubernetes
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--write-kubeconfig-mode 644" bash > /dev/null 2>&1 || true

mkdir -p /home/ubuntu/.kube
cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config 2>/dev/null || true
chown -R ubuntu:ubuntu /home/ubuntu/.kube 2>/dev/null || true
chmod 600 /home/ubuntu/.kube/config 2>/dev/null || true

echo "Bootstrap complete" > /var/log/bootstrap.log
