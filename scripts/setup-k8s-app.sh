#!/usr/bin/env bash
# Apply ApexPOS k8s manifests (run on EC2 after secrets exist).
# Usage: bash scripts/setup-k8s-app.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

kubectl apply -f "${ROOT}/k8s/namespace.yml"
kubectl apply -f "${ROOT}/k8s/backend/configmap.yml"

if ! kubectl get secret backend-secrets -n apexpos &>/dev/null; then
  echo "ERROR: Create backend-secrets first:"
  echo "  kubectl create secret generic backend-secrets -n apexpos \\"
  echo "    --from-literal=MONGODB_URI='mongodb+srv://...' \\"
  echo "    --from-literal=JWT_SECRET='\$(openssl rand -hex 32)'"
  exit 1
fi

kubectl apply -f "${ROOT}/k8s/backend/deployment.yml"
kubectl apply -f "${ROOT}/k8s/backend/service.yml"
kubectl apply -f "${ROOT}/k8s/ingress/ingress.yml"

kubectl rollout status deployment/apexpos-backend -n apexpos --timeout=120s
kubectl get pods,svc -n apexpos

echo "API smoke test:"
curl -sf "http://127.0.0.1:30500/" && echo
