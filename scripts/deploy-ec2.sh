#!/bin/bash
set -euo pipefail

# ApexPOS Deployment to EC2 t3.micro
# This script handles Docker build, push, and k3s deployment

DOCKER_REGISTRY="${DOCKER_REGISTRY:-tharusha69}"
BACKEND_IMAGE="${DOCKER_REGISTRY}/apexpos-backend:latest"
FRONTEND_IMAGE="${DOCKER_REGISTRY}/apexpos-frontend:latest"
NAMESPACE="apexpos"

echo "========================================="
echo "ApexPOS - EC2 Deployment Script"
echo "========================================="

# Parse arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 <build|deploy|both> [--push] [--skip-frontend]"
    echo ""
    echo "Options:"
    echo "  build              - Build Docker images locally"
    echo "  deploy             - Deploy to k3s cluster"
    echo "  both               - Build and deploy (default)"
    echo "  --push             - Push images to Docker Hub after build"
    echo "  --skip-frontend    - Skip frontend build/deploy"
    exit 1
fi

ACTION="$1"
PUSH_IMAGES=false
SKIP_FRONTEND=false

# Parse optional flags
shift || true
while [ $# -gt 0 ]; do
    case "$1" in
        --push)
            PUSH_IMAGES=true
            ;;
        --skip-frontend)
            SKIP_FRONTEND=true
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
    shift || true
done

# ============ BUILD STAGE ============
if [ "$ACTION" = "build" ] || [ "$ACTION" = "both" ]; then
    echo ""
    echo "📦 Building Docker images..."
    echo ""
    
    # Build backend
    echo "Building backend: $BACKEND_IMAGE"
    docker build -t "$BACKEND_IMAGE" ./server
    
    # Build frontend (unless skipped)
    if [ "$SKIP_FRONTEND" = false ]; then
        echo "Building frontend: $FRONTEND_IMAGE"
        docker build -t "$FRONTEND_IMAGE" ./client
    fi
    
    # Push images if requested
    if [ "$PUSH_IMAGES" = true ]; then
        echo ""
        echo "📤 Pushing images to Docker Hub..."
        docker push "$BACKEND_IMAGE"
        if [ "$SKIP_FRONTEND" = false ]; then
            docker push "$FRONTEND_IMAGE"
        fi
        echo "✅ Images pushed successfully"
    fi
fi

# ============ DEPLOY STAGE ============
if [ "$ACTION" = "deploy" ] || [ "$ACTION" = "both" ]; then
    echo ""
    echo "🚀 Deploying to k3s..."
    echo ""
    
    # Check k3s connectivity
    if ! kubectl cluster-info &> /dev/null; then
        echo "❌ Error: Cannot connect to k3s cluster"
        echo "   Make sure kubectl is configured: export KUBECONFIG=/etc/rancher/k3s/k3s.yaml"
        exit 1
    fi
    
    # Create namespace
    echo "Creating namespace: $NAMESPACE"
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply manifests in order
    echo "Applying Kubernetes manifests..."
    kubectl apply -f k8s/namespace.yml
    kubectl apply -f k8s/backend/configmap.yml
    kubectl apply -f k8s/backend/secrets.yml
    kubectl apply -f k8s/backend/deployment.yml
    kubectl apply -f k8s/backend/service.yml
    kubectl apply -f k8s/ingress/ingress.yml
    
    # Wait for deployment
    echo "Waiting for deployment to be ready (this may take 1-2 minutes)..."
    kubectl rollout status deployment/apexpos-backend -n "$NAMESPACE" --timeout=300s
    
    # Get service info
    echo ""
    echo "========================================="
    echo "✅ Deployment successful!"
    echo "========================================="
    echo ""
    echo "Service endpoints:"
    kubectl get svc -n "$NAMESPACE" -o wide
    echo ""
    echo "Pod status:"
    kubectl get pods -n "$NAMESPACE" -o wide
    echo ""
    echo "Check logs:"
    echo "  kubectl logs -f deployment/apexpos-backend -n $NAMESPACE"
    echo ""
    echo "NodePort API endpoint:"
    NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}')
    if [ -z "$NODE_IP" ]; then
        NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
    fi
    echo "  http://$NODE_IP:30500"
fi

echo ""
echo "Done! 🎉"
