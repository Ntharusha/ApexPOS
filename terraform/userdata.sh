#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update && apt-get upgrade -y

# Swap — required for k3s + Argo CD on 1GB RAM (t3.micro)
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Docker — Jenkins CI builds on host
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu

# k3s — single-node Kubernetes
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--write-kubeconfig-mode 644" sh -

mkdir -p /home/ubuntu/.kube
cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
chown -R ubuntu:ubuntu /home/ubuntu/.kube
chmod 600 /home/ubuntu/.kube/config

echo "Bootstrap complete: Docker + k3s ready. Run scripts/bootstrap-ec2-k3s.sh for ingress if needed."
