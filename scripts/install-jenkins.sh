#!/usr/bin/env bash
# Run on EC2 after Docker is available (post-terraform / userdata).
# Usage: sudo bash scripts/install-jenkins.sh

set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash $0"
  exit 1
fi

docker volume create jenkins_home 2>/dev/null || true

if docker ps -a --format '{{.Names}}' | grep -q '^jenkins$'; then
  echo "Jenkins container already exists. Start with: docker start jenkins"
  exit 0
fi

docker run -d --name jenkins \
  --restart unless-stopped \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /home/ubuntu/.kube:/var/jenkins_home/.kube:ro \
  -u root \
  jenkins/jenkins:lts-jdk17

echo "Jenkins starting on :8080"
echo "Initial admin password:"
docker logs jenkins 2>&1 | grep -A1 'Please use the following password' || docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null || true
