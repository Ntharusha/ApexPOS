#!/usr/bin/env bash
# Install Argo CD on k3s and expose NodePort 30080.
# Usage: bash scripts/install-argocd.sh  (as ubuntu with kubectl)

set -euo pipefail

kubectl create namespace argocd 2>/dev/null || true

kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

kubectl wait --namespace argocd \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/name=argocd-server \
  --timeout=300s

kubectl patch svc argocd-server -n argocd --type merge -p \
  '{"spec":{"type":"NodePort","ports":[{"name":"http","port":80,"targetPort":8080,"nodePort":30080}]}}'

echo "Argo CD UI: http://<EC2-EIP>:30080"
echo "Admin password:"
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d
echo
