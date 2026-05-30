#!/usr/bin/env bash
# Run on EC2 after Terraform + userdata (or if userdata only installed Docker).
# Usage: sudo bash bootstrap-ec2-k3s.sh

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash $0"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> System update"
apt-get update && apt-get upgrade -y

if ! swapon --show | grep -q /swapfile; then
  echo "==> Creating 2GB swap"
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

if ! command -v docker &>/dev/null; then
  echo "==> Installing Docker"
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker ubuntu
fi

if ! command -v k3s &>/dev/null; then
  echo "==> Installing k3s"
  curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--write-kubeconfig-mode 644" sh -
fi

echo "==> Configuring kubectl for ubuntu"
mkdir -p /home/ubuntu/.kube
cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
chown -R ubuntu:ubuntu /home/ubuntu/.kube
chmod 600 /home/ubuntu/.kube/config

echo "==> Installing ingress-nginx (bare metal)"
sudo -u ubuntu kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.0/deploy/static/provider/baremetal/deploy.yaml

echo "==> Waiting for ingress controller"
sudo -u ubuntu kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=300s

echo "==> Bootstrap complete"
sudo -u ubuntu kubectl get nodes
echo "Next: create secrets, apply k8s manifests, install Argo CD (see IMPLEMENTATION_PLAN_EC2_K8S.md)"
