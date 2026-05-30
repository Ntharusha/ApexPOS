# ApexPOS — Production Deployment Plan (100% Free Tier)

## Table of Contents
1. [Free-Tier Architecture Overview](#1-free-tier-architecture-overview)
2. [Free Services Used](#2-free-services-used)
3. [Prerequisites & Accounts](#3-prerequisites--accounts)
4. [Phase 1 — MongoDB Atlas Free Cluster](#4-phase-1--mongodb-atlas-free-cluster)
5. [Phase 2 — Dockerization](#5-phase-2--dockerization)
6. [Phase 3 — Terraform (AWS Free-Tier Infrastructure)](#6-phase-3--terraform-aws-free-tier-infrastructure)
7. [Phase 4 — Server Configuration (Shell Scripts)](#7-phase-4--server-configuration-shell-scripts)
8. [Phase 5 — Kubernetes with k3s](#8-phase-5--kubernetes-with-k3s)
9. [Phase 6 — Jenkins CI/CD Pipeline](#9-phase-6--jenkins-cicd-pipeline)
10. [Phase 7 — Frontend Deployment (Vercel Free)](#10-phase-7--frontend-deployment-vercel-free)
11. [Phase 8 — AWS CloudWatch Free Tier Monitoring](#11-phase-8--aws-cloudwatch-free-tier-monitoring)
12. [Repository Structure](#12-repository-structure)
13. [Deployment Timeline](#13-deployment-timeline)
14. [Cost Summary](#14-cost-summary)
15. [Quick Start Checklist](#15-quick-start-checklist)

---

## 1. Free-Tier Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Developer Machine                     │
│  git push → GitHub → Jenkins Webhook → CI Pipeline      │
└─────────────────────────┬───────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   AWS EC2 t2.micro      │
              │   (Free 12 months)      │
              │   Ubuntu 22.04 LTS      │
              │   1 vCPU + 1GB RAM      │
              │   + 2GB Swap            │
              │                         │
              │  ┌──────────────────┐   │
              │  │  k3s (Kubernetes)│   │
              │  │  Backend Pod     │   │
              │  │  Ingress Nginx   │   │
              │  │  Argo CD         │   │
              │  └──────────────────┘   │
              │  Jenkins (Docker host)  │
              │  CloudWatch Agent       │
              └────────────┬────────────┘
                           │
               ┌───────────▼───────────┐
               │  MongoDB Atlas (Free)  │
               │  M0 Cluster — 512MB    │
               │  Shared, 3 Node RS     │
               └────────────────────────┘
```

```
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│  Terraform   │    │ Shell Scripts│    │  CloudWatch Free │
│  (Free OSS)  │    │ (Deployment) │    │  10 Alarms       │
└──────────────┘    └──────────────┘    │  5GB Logs        │
                                        └──────────────────┘
```

### Key Design Decisions for Free Tier
| Paid Service | Free Replacement | Savings |
|---|---|---|
| AWS EKS ($73/mo control plane) | **k3s** on EC2 (lightweight K8s) | $73/mo |
| Multiple EC2 instances | **Single t2.micro** running everything | $60+/mo |
| NAT Gateway ($32/mo) | **Public subnet only** (no NAT needed) | $32/mo |
| ALB ($22/mo) | **Nginx Ingress** on NodePort | $22/mo |
| Ansible / Config Mgmt tool | **Bash scripts** in `scripts/` | Complexity |
| **Total Savings** | | **$187+/mo** |

---

## 2. Free Services Used

| Service | Free Tier Details | Duration |
|---------|------------------|----------|
| **AWS EC2** | 750 hrs/mo of t2.micro (1 vCPU, 1GB RAM) | 12 months |
| **AWS EBS** | 30 GB of gp2/gp3 storage | 12 months |
| **AWS CloudWatch** | 10 custom metrics, 10 alarms, 5GB log ingestion | Always free |
| **AWS Data Transfer** | 100 GB/mo outbound | 12 months |
| **MongoDB Atlas M0** | 512 MB storage, shared cluster, 100 max connections | Always free |
| **Vercel Hobby** | 100 GB bandwidth, 100 deployments/day | Always free |
| **Docker Hub** | 1 private repo, unlimited public repos | Always free |
| **k3s** | Lightweight Kubernetes (CNCF certified) | Always free (OSS) |
| **Jenkins** | Open-source CI/CD | Always free (OSS) |
| **Terraform** | Open-source IaC | Always free (OSS) |
| **Argo CD** | Open-source GitOps CD | Always free (OSS) |
| **Let's Encrypt** | Free SSL certificates | Always free |
| **Cloudflare** | Free DNS + CDN + SSL | Always free |

---

## 3. Prerequisites & Accounts

### Accounts to Create (All Free)
| Service | Sign Up URL | Notes |
|---------|-------------|-------|
| **AWS** | https://aws.amazon.com/free | Need credit card (won't be charged if within free tier) |
| **MongoDB Atlas** | https://www.mongodb.com/cloud/atlas/register | Select M0 Free cluster |
| **Vercel** | https://vercel.com/signup | Sign up with GitHub |
| **Docker Hub** | https://hub.docker.com/signup | Free account |
| **GitHub** | https://github.com/signup | Already have it |

### Local Tools Required
```bash
# Install these on your local machine
sudo apt install awscli terraform git docker.io -y

# Configure AWS CLI
aws configure
# AWS Access Key ID: <from IAM>
# AWS Secret Access Key: <from IAM>
# Default region: ap-south-1
# Default output format: json
```

---

## 4. Phase 1 — MongoDB Atlas Free Cluster

### 4.1 Cluster Setup
1. Login to https://cloud.mongodb.com
2. Create **New Project** → "ApexPOS"
3. Build a Database → **M0 Free** → Provider: AWS → Region: **ap-south-1** (Mumbai)
4. Cluster Name: `ApexPOS-Free`
5. Create Database User:
   - Username: `apexpos_user`
   - Password: Generate secure password
   - Role: `readWriteAnyDatabase`
6. Network Access → Add IP → `0.0.0.0/0` (for EC2 access)
7. Connect → Drivers → Node.js → Copy connection string

### 4.2 Free Tier Limits
| Resource | Limit |
|---|---|
| Storage | 512 MB |
| RAM | Shared |
| Connections | 100 max |
| Network | No peering/private endpoints |
| Backups | No (use `mongodump` manually) |
| Ops/sec | 100 |

> 💡 **512MB is enough for**: ~50,000 products, ~100,000 sales records, and all other collections for a single-store POS system.

---

## 5. Phase 2 — Dockerization

### 5.1 Backend Dockerfile (`server/Dockerfile`)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### 5.2 Frontend Dockerfile (`client/Dockerfile`)
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 5.3 Docker Compose (Local Dev)
```yaml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
  frontend:
    build:
      context: ./client
      args:
        VITE_API_URL: http://localhost:5000/api
    ports:
      - "80:80"
    depends_on:
      - backend
```

### 5.4 Build & Push to Docker Hub
```bash
# Login
docker login

# Build & push backend
docker build -t yourdockerhubuser/apexpos-backend:latest ./server
docker push yourdockerhubuser/apexpos-backend:latest

# Build & push frontend
docker build \
  --build-arg VITE_API_URL=http://<EC2-IP>:30500/api \
  -t yourdockerhubuser/apexpos-frontend:latest ./client
docker push yourdockerhubuser/apexpos-frontend:latest
```

---

## 6. Phase 3 — Terraform (AWS Free-Tier Infrastructure)

### 6.1 Terraform Files Structure
```
terraform/
├── main.tf          # VPC, EC2, SG, EIP
├── variables.tf     # Input variables
├── outputs.tf       # EC2 IP, URLs
├── userdata.sh      # Bootstrap script (runs on first boot)
└── terraform.tfvars # Your values (gitignored)
```

### 6.2 Key Resources Created
- **VPC** with public subnet (no NAT Gateway needed)
- **Security Group**: ports 22, 80, 443, 8080, 30080, 30500 open
- **EC2 t2.micro**: Ubuntu 22.04, 20GB EBS gp3
- **Elastic IP**: Static public IP for DNS

### 6.3 Deploy Infrastructure
```bash
# 1. Copy and edit vars
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit: key_name, docker_hub_user, alert_email

# 2. Initialize & Apply
terraform init
terraform plan
terraform apply

# 3. Note the outputs
# server_public_ip = "x.x.x.x"
# jenkins_url      = "http://x.x.x.x:8080"
# backend_api_url  = "http://x.x.x.x:30500"
```

---

## 7. Phase 4 — Server Configuration (Shell Scripts)

Rather than using complex configuration management tools, we use lightweight, standalone shell scripts in `scripts/` that run directly on the EC2 instance.

### 7.1 Setup Scripts Overview

| Script | Purpose |
|--------|---------|
| `scripts/bootstrap-ec2-k3s.sh` | Creates swap, installs Docker, k3s, ingress-nginx |
| `scripts/install-argocd.sh` | Installs Argo CD on k3s, exposes via NodePort 30080 |
| `scripts/install-jenkins.sh` | Starts Jenkins in Docker on host, port 8080 |
| `scripts/setup-k8s-app.sh` | Applies k8s secrets, manifests, runs smoke test |

### 7.2 Execution Order
```bash
# 1. SSH into your EC2 instance
ssh -i ~/.ssh/apexpos-key.pem ubuntu@<EC2-PUBLIC-IP>

# 2. Clone the repo
git clone https://github.com/Ntharusha/ApexPOS.git
cd ApexPOS

# 3. Run scripts in order
sudo bash scripts/bootstrap-ec2-k3s.sh
bash scripts/install-argocd.sh
sudo bash scripts/install-jenkins.sh

# 4. Create K8s secrets FIRST, then apply manifests
kubectl create secret generic backend-secrets -n apexpos \
  --from-literal=MONGODB_URI='mongodb+srv://...' \
  --from-literal=JWT_SECRET="$(openssl rand -hex 32)"

bash scripts/setup-k8s-app.sh
```

### 7.3 What `bootstrap-ec2-k3s.sh` Does
- System update
- Creates 2GB swap file (critical for 1GB RAM t2.micro)
- Installs Docker (if not present)
- Installs k3s with kubeconfig permissions
- Installs ingress-nginx bare-metal controller

---

## 8. Phase 5 — Kubernetes with k3s

### 8.1 Why k3s Instead of EKS
| Feature | EKS | k3s |
|---------|-----|-----|
| Cost | $73/mo (control plane) | **$0** (runs on EC2) |
| RAM Usage | N/A (managed) | ~512MB |
| CNCF Certified | Yes | Yes |
| kubectl Compatible | Yes | Yes |
| Production Ready | Yes | Yes (used by Rancher) |
| Ingress | ALB ($22/mo) | Built-in Traefik/Nginx ($0) |

### 8.2 K8s Manifests Structure
```
k8s/
├── namespace.yml
├── backend/
│   ├── deployment.yml
│   ├── service.yml
│   └── configmap.yml
└── ingress/
    └── ingress.yml
```

### 8.3 Namespace (`k8s/namespace.yml`)
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: apexpos
  labels:
    app: apexpos
```

### 8.4 Backend ConfigMap (`k8s/backend/configmap.yml`)
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: apexpos
data:
  PORT: "5000"
  NODE_ENV: "production"
```

### 8.5 Backend Deployment (`k8s/backend/deployment.yml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: apexpos-backend
  namespace: apexpos
spec:
  replicas: 1
  selector:
    matchLabels:
      app: apexpos-backend
  template:
    metadata:
      labels:
        app: apexpos-backend
    spec:
      containers:
      - name: backend
        image: yourdockerhubuser/apexpos-backend:latest
        ports:
        - containerPort: 5000
        envFrom:
        - configMapRef:
            name: backend-config
        - secretRef:
            name: backend-secrets
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 8.6 Backend Service (`k8s/backend/service.yml`)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: apexpos-backend
  namespace: apexpos
spec:
  selector:
    app: apexpos-backend
  ports:
  - port: 5000
    targetPort: 5000
    nodePort: 30500
  type: NodePort
```

### 8.7 Ingress (`k8s/ingress/ingress.yml`)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: apexpos-ingress
  namespace: apexpos
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: apexpos-backend
            port:
              number: 5000
```

### 8.8 Argo CD GitOps Application (`k8s/argocd-app.yml`)
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: apexpos
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/Ntharusha/ApexPOS.git
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: apexpos
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

---

## 9. Phase 6 — Jenkins CI/CD Pipeline

### 9.1 Jenkinsfile Overview
The `Jenkinsfile` at the project root defines the CI pipeline:

```
Pipeline Stages:
    ├── 1. Checkout
    ├── 2. Install dependencies (backend + frontend)
    ├── 3. Lint frontend
    ├── 4. Build frontend
    ├── 5. Build Docker image (backend)
    ├── 6. Push image to Docker Hub
    ├── 7. kubectl set image → rolling update on k3s
    └── 8. Smoke test → curl health check
```

### 9.2 Jenkins Setup Steps
1. **Access Jenkins**: `http://<EC2-IP>:8080`
2. **Enter Initial Password** (printed by `install-jenkins.sh`, or run: `docker logs jenkins`)
3. **Install Suggested Plugins** + these additional:
   - Docker Pipeline
   - Git / GitHub Integration
   - Pipeline
4. **Add Credentials** (Manage Jenkins → Credentials → Global):

   | ID | Type | Value |
   |---|---|---|
   | `dockerhub-creds` | Username/Password | Docker Hub login |
   | `github-token` | Secret text | GitHub PAT |
   | `kubeconfig` | Secret file | `/home/ubuntu/.kube/config` |

5. **Create Pipeline Job**:
   - New Item → Pipeline
   - Pipeline → "Pipeline script from SCM"
   - SCM: Git → `https://github.com/Ntharusha/ApexPOS.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

6. **Add Webhook** (GitHub → Repo Settings → Webhooks):
   - Payload URL: `http://<EC2-IP>:8080/github-webhook/`
   - Content type: `application/json`
   - Events: Push

---

## 10. Phase 7 — Frontend Deployment (Vercel Free)

### 10.1 Vercel Free Tier Limits
| Feature | Free Limit |
|---------|-----------|
| Deployments | 100/day |
| Bandwidth | 100 GB/mo |
| Build Time | 6000 min/mo |
| Serverless Functions | 100 GB-hrs/mo |
| Custom Domains | Unlimited |
| SSL | Automatic |

### 10.2 Setup Steps
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"** → select `ApexPOS`
3. **Root Directory**: `client`
4. **Framework Preset**: Vite
5. **Environment Variables**:
   ```
   VITE_API_URL = http://<EC2-PUBLIC-IP>:30500/api
   ```
6. **Deploy** → Vercel auto-deploys on every `main` push

### 10.3 Update Frontend API URL
In `client/src/api/axios.ts`, the base URL is driven by `VITE_API_URL`:
```typescript
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
```

---

## 11. Phase 8 — AWS CloudWatch Free Tier Monitoring

### 11.1 Free Tier Limits
| Resource | Free Allowance |
|---|---|
| Custom Metrics | 10 metrics |
| Alarms | 10 alarms |
| Log Ingestion | 5 GB/month |
| Log Storage | 5 GB/month |
| Dashboards | 3 dashboards |

### 11.2 CloudWatch Alarms (Terraform)
Key alarms configured in `terraform/main.tf`:
- **CPU > 80%** for 2 consecutive 5-min periods → SNS alert
- **Memory > 85%** (via CloudWatch Agent custom metric)
- **Disk > 80%** (via CloudWatch Agent custom metric)

### 11.3 CloudWatch Agent Config (`scripts/cloudwatch-config.json`)
```json
{
  "agent": {
    "metrics_collection_interval": 300,
    "run_as_user": "root"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/syslog",
            "log_group_name": "/apexpos/ec2/syslog",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  },
  "metrics": {
    "metrics_collected": {
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 300
      },
      "disk": {
        "measurement": ["disk_used_percent"],
        "resources": ["/"],
        "metrics_collection_interval": 300
      }
    }
  }
}
```

### 11.4 Install CloudWatch Agent on EC2
```bash
# Download and install
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Copy config and start
sudo cp scripts/cloudwatch-config.json /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
sudo systemctl start amazon-cloudwatch-agent
sudo systemctl enable amazon-cloudwatch-agent
```

---

## 12. Repository Structure

```
ApexPOS/
├── ApexPOS_SaaS_Main/                   # App source code
│   ├── client/                          # React + Vite frontend
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── server/                          # Node.js + Express backend
│       ├── routes/
│       ├── models/
│       ├── server.js
│       ├── Dockerfile
│       └── package.json
├── k8s/                                 # Kubernetes manifests
│   ├── namespace.yml
│   ├── backend/
│   │   ├── deployment.yml
│   │   ├── service.yml
│   │   └── configmap.yml
│   └── ingress/
│       └── ingress.yml
├── scripts/                             # Server Setup & Config Scripts
│   ├── bootstrap-ec2-k3s.sh             # System bootstrap (k3s, Docker, swap)
│   ├── install-argocd.sh                # Argo CD installation
│   ├── install-jenkins.sh               # Jenkins (Docker on host)
│   ├── setup-k8s-app.sh                 # Apply k8s manifests
│   └── cloudwatch-config.json           # CloudWatch Agent config
├── terraform/                           # AWS infrastructure as code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── userdata.sh
├── Jenkinsfile                          # CI pipeline definition
├── docker-compose.yml                   # Local development
├── IMPLEMENTATION_PLAN_EC2_K8S.md       # Step-by-step execution checklist
├── DEPLOY_STATUS.md                     # Current deployment status
└── README.md
```

---

## 13. Deployment Timeline

| Day | Tasks |
|-----|-------|
| **Day 1** | Create AWS account, Atlas account, Vercel account |
| **Day 1** | Run `terraform apply` → EC2 instance up |
| **Day 1** | SSH in, run `bootstrap-ec2-k3s.sh` |
| **Day 2** | Run `install-argocd.sh` + `install-jenkins.sh` |
| **Day 2** | Create K8s secrets, run `setup-k8s-app.sh` |
| **Day 2** | Verify backend pod running, API responding |
| **Day 3** | Configure Jenkins pipeline, add credentials |
| **Day 3** | Add GitHub webhook, test CI/CD end-to-end |
| **Day 3** | Deploy frontend to Vercel, set `VITE_API_URL` |
| **Day 4** | Install CloudWatch Agent, verify monitoring |
| **Day 4** | Lock down security groups, final validation |

---

## 14. Cost Summary

| Service | Monthly Cost |
|---------|-------------|
| AWS EC2 t2.micro (750 hrs) | **$0** (free tier 12 months) |
| AWS EBS 20GB gp3 | **$0** (free tier 30GB) |
| AWS CloudWatch | **$0** (within free limits) |
| MongoDB Atlas M0 | **$0** (always free) |
| Vercel Hobby | **$0** (always free) |
| Docker Hub | **$0** (public repo) |
| k3s / Jenkins / Argo CD | **$0** (open source) |
| **Total** | **$0/month** |

> ⚠️ **After 12 months**: EC2 and EBS will incur charges (~$8-10/mo for t2.micro). Plan to migrate to a budget VPS (DigitalOcean $4/mo droplet) or upgrade strategy at that point.

---

## 15. Quick Start Checklist

```
INFRASTRUCTURE
[ ] AWS account created, IAM user with EC2/CloudWatch permissions
[ ] SSH key pair created and downloaded
[ ] terraform apply completed successfully
[ ] EC2 instance reachable via SSH

SERVER SETUP
[ ] bootstrap-ec2-k3s.sh executed (k3s running, ingress-nginx ready)
[ ] install-argocd.sh executed (Argo CD accessible on :30080)
[ ] install-jenkins.sh executed (Jenkins accessible on :8080)

KUBERNETES
[ ] backend-secrets created (MONGODB_URI + JWT_SECRET)
[ ] setup-k8s-app.sh executed
[ ] kubectl get pods -n apexpos → backend pod Running
[ ] curl http://<EC2-IP>:30500/ → returns 200 OK

CI/CD
[ ] Jenkins pipeline job created
[ ] Docker Hub credentials added to Jenkins
[ ] GitHub webhook configured and tested
[ ] Push to main → pipeline runs → new image deployed

FRONTEND
[ ] Vercel project created from GitHub repo
[ ] VITE_API_URL set to http://<EC2-IP>:30500/api
[ ] Frontend accessible and connects to backend

MONITORING
[ ] CloudWatch Agent installed and running
[ ] CPU/Memory/Disk alarms created
[ ] Alert email confirmed

SECURITY
[ ] Security group reviewed — only needed ports open
[ ] Jenkins and Argo CD access restricted (change default passwords)
[ ] HTTPS configured via Let's Encrypt (optional but recommended)
```
