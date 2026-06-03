#!/usr/bin/env bash
# Starts Jenkins in Docker with memory limits (safe for t3.micro 1GB RAM).
# Usage: sudo bash scripts/install-jenkins.sh

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash $0"
  exit 1
fi

docker volume create jenkins_home 2>/dev/null || true

# Remove existing container if stopped/dead
if docker ps -a --format '{{.Names}}' | grep -q '^jenkins$'; then
  STATUS=$(docker inspect --format='{{.State.Status}}' jenkins)
  if [ "$STATUS" = "running" ]; then
    echo "Jenkins already running at http://\$(hostname -I | awk '{print \$1}'):8080"
    exit 0
  else
    echo "Removing old stopped Jenkins container..."
    docker rm jenkins
  fi
fi

echo "Starting Jenkins with memory limits (700MB max)..."

docker run -d --name jenkins \
  --restart unless-stopped \
  --memory="700m" \
  --cpus="0.8" \
  -p 8080:8080 -p 50000:50000 \
  -e JAVA_OPTS="-Xmx256m -Xms128m -XX:MaxMetaspaceSize=128m -Dhudson.model.DirectoryBrowserSupport.CSP=" \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /etc/rancher/k3s/k3s.yaml:/root/.kube/config:ro \
  -u root \
  jenkins/jenkins:lts-jdk17

echo ""
echo "✅ Jenkins starting on port 8080 (memory limited to 700MB)"
echo "⏳ Wait ~60 seconds for Jenkins to fully start..."
echo ""
echo "Initial admin password (run after 60 seconds):"
echo "  sudo docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
