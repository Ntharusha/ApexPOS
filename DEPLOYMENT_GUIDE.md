# ApexPOS EC2 t3.micro Deployment Guide

**Status**: Ready for deployment  
**Architecture**: k3s + Docker + Jenkins + CloudWatch  
**Cost**: Free (AWS free tier - 12 months)  
**Region**: ap-south-1 (Mumbai)

---

## 📋 Pre-Deployment Checklist

- [ ] AWS account created with free tier eligibility verified
- [ ] EC2 key pair created in AWS Console (ap-south-1)
- [ ] MongoDB Atlas M0 cluster created
- [ ] Docker Hub account created
- [ ] GitHub webhook configured (optional)
- [ ] Public IP documented for SSH access
- [ ] Alert email configured for CloudWatch

---

## 🚀 Step-by-Step Deployment

### Step 1: Update Terraform Configuration

**File**: `terraform/terraform.tfvars`

Update with your actual values:
```hcl
key_pair_name = "your-ec2-key-pair-name"          # Your EC2 key pair name
admin_ip      = "YOUR_PUBLIC_IP/32"                # Your public IP for SSH access
alert_email   = "your-email@example.com"           # Email for CloudWatch alarms
aws_region    = "ap-south-1"
environment   = "prod"
```

### Step 2: Deploy Infrastructure with Terraform

```bash
cd terraform/

# Initialize Terraform (first time only)
terraform init

# Review planned resources
terraform plan

# Deploy EC2, VPC, security groups, CloudWatch
terraform apply

# Save the output (you'll need the public IP)
terraform output
```

**Output**: EC2 instance IP, Elastic IP, security group ID

### Step 3: Connect to EC2 and Verify Installation

```bash
# SSH into EC2 (wait 2-3 minutes after terraform apply for userdata to complete)
ssh -i /path/to/key.pem ubuntu@YOUR_EC2_IP

# Verify Docker is installed
docker ps

# Verify k3s is installed
kubectl get nodes

# Verify swap was created
swapon --show

# Verify kubeconfig
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
kubectl cluster-info
```

### Step 4: Update Environment Variables

**SSH into EC2**, then:

```bash
# Clone or pull the latest repo (if not already done)
git clone https://github.com/yourusername/ApexPOS.git
cd ApexPOS

# Update MongoDB Atlas connection string
vi server/.env
```

**Edit `server/.env`**:
```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/apexpos?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
ALLOWED_ORIGINS=http://YOUR_EC2_IP,http://localhost,https://apexpos.vercel.app
```

**Edit `client/.env`**:
```bash
REACT_APP_API_URL=http://YOUR_EC2_IP:30500
```

### Step 5: Update Kubernetes Secrets

**On EC2**, edit `k8s/backend/secrets.yml`:

```bash
vi k8s/backend/secrets.yml
```

Replace placeholder values:
```yaml
stringData:
  MONGODB_URI: "mongodb+srv://username:password@cluster.mongodb.net/apexpos?retryWrites=true&w=majority"
  JWT_SECRET: "your-actual-secret-key"
```

### Step 6: Build and Push Docker Images

**Option A: Build on your local machine**
```bash
# Login to Docker Hub
docker login

# Build backend
docker build -t your-username/apexpos-backend:latest ./server
docker push your-username/apexpos-backend:latest

# Build frontend
docker build -t your-username/apexpos-frontend:latest ./client
docker push your-username/apexpos-frontend:latest
```

**Option B: Build on EC2 (slower, but saves bandwidth)**
```bash
# SSH into EC2
ssh -i /path/to/key.pem ubuntu@YOUR_EC2_IP

# Clone repo if not done
git clone https://github.com/yourusername/ApexPOS.git
cd ApexPOS

# Run deployment script
export DOCKER_REGISTRY=your-username
./scripts/deploy-ec2.sh build --push
```

### Step 7: Deploy Backend to k3s

**On EC2**:
```bash
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

# Deploy all k8s manifests
./scripts/deploy-ec2.sh deploy
```

Or manually:
```bash
# Apply manifests in order
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/backend/configmap.yml
kubectl apply -f k8s/backend/secrets.yml
kubectl apply -f k8s/backend/deployment.yml
kubectl apply -f k8s/backend/service.yml
kubectl apply -f k8s/ingress/ingress.yml

# Verify deployment
kubectl get pods -n apexpos
kubectl logs -f deployment/apexpos-backend -n apexpos
```

### Step 8: Verify Backend is Running

```bash
# Get the NodePort endpoint
kubectl get svc -n apexpos

# Test backend health
curl http://YOUR_EC2_IP:30500/

# Test MongoDB connection
curl http://YOUR_EC2_IP:30500/
```

### Step 9: Deploy Frontend (Optional)

**Option A: Deploy on Vercel (Recommended)**
```bash
# Go to https://vercel.com and connect your GitHub repo
# Set environment variable: REACT_APP_API_URL=http://YOUR_EC2_IP:30500
# Auto-deploy on push
```

**Option B: Deploy on k3s**
```bash
# Update Traefik ingress hostname in k8s/ingress/ingress.yml
# Update docker-compose or k8s manifests to include frontend
# kubectl apply -f k8s/frontend/...
```

### Step 10: Setup Jenkins (Optional but Recommended)

**On EC2**:
```bash
# Start Jenkins container
docker run -d \
  --restart unless-stopped \
  -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Get initial password
docker exec -it $(docker ps --filter ancestor=jenkins/jenkins:lts -q) cat /var/jenkins_home/secrets/initialAdminPassword

# Access Jenkins at http://YOUR_EC2_IP:8080
# Configure GitHub webhook to trigger builds
```

### Step 11: Configure CloudWatch Monitoring

CloudWatch is already configured by Terraform:

```bash
# Check CloudWatch logs in AWS Console
# Logs group: /apexpos/server

# Verify alarms
aws cloudwatch describe-alarms --region ap-south-1

# Confirm SNS email subscription (check your email)
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] EC2 instance is running (`terraform output` or AWS Console)
- [ ] Security group allows ports 22 (SSH), 80, 443, 5000, 6443, 30500
- [ ] k3s is running: `kubectl get nodes`
- [ ] Backend pod is running: `kubectl get pods -n apexpos`
- [ ] Backend responds to health check: `curl http://EC2_IP:30500/`
- [ ] MongoDB connection works: check logs `kubectl logs -f deployment/apexpos-backend -n apexpos`
- [ ] CloudWatch logs are streaming to `/apexpos/server`
- [ ] SNS email subscription is confirmed
- [ ] Frontend is accessible (if deployed)
- [ ] Jenkins is running (if setup): http://EC2_IP:8080

---

## 🔧 Troubleshooting

### Pod won't start
```bash
# Check pod status and events
kubectl describe pod -n apexpos <pod-name>

# View logs
kubectl logs -n apexpos <pod-name>
```

### MongoDB connection fails
```bash
# Check credentials in secrets
kubectl get secret backend-secrets -n apexpos -o yaml

# Verify MongoDB Atlas IP whitelist includes EC2 security group CIDR (10.0.0.0/16)
```

### Out of memory errors
```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n apexpos

# k3s comes with 2GB swap from userdata.sh
# If still insufficient, scale down other services
```

### Docker build failures
```bash
# Free up disk space
docker system prune -a

# Check disk usage
df -h

# EBS volume is 30GB (free tier max)
```

### Can't SSH to EC2
```bash
# Check security group allows port 22 from your IP
# Update terraform.tfvars admin_ip to include your IP

# Update security group:
terraform apply
```

---

## 💰 Cost Estimate (12 months)

| Service | Cost | Free Tier Coverage |
|---------|------|-------------------|
| EC2 t3.micro (750 hrs/mo) | $0 | ✅ 12 months |
| EBS 30GB gp3 | $0 | ✅ 12 months |
| CloudWatch (10 alarms) | $0 | ✅ Always free |
| Data transfer (100GB/mo) | $0 | ✅ 12 months |
| MongoDB Atlas M0 | $0 | ✅ Always free |
| Vercel frontend | $0 | ✅ Always free |
| **TOTAL** | **$0** | ✅ **Free for 12 months** |

After 12 months, expect ~$15-30/month to continue (t3.micro and small EBS).

---

## 🔒 Security Recommendations

After deployment, harden your setup:

1. **Restrict SSH access**:
   ```bash
   # Update terraform.tfvars
   admin_ip = "YOUR_ACTUAL_IP/32"  # Instead of 0.0.0.0/0
   terraform apply
   ```

2. **Update JWT_SECRET**:
   ```bash
   # Generate new secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Update k8s secret
   kubectl edit secret backend-secrets -n apexpos
   ```

3. **Enable CloudWatch detailed monitoring** (paid, optional):
   ```bash
   # Current setup uses standard 5-minute intervals
   ```

4. **Setup SSL/TLS** (free with Let's Encrypt):
   ```bash
   # Install cert-manager on k3s
   helm repo add jetstack https://charts.jetstack.io
   helm install cert-manager jetstack/cert-manager -n cert-manager --create-namespace
   
   # Update ingress.yml with cert-manager annotations
   ```

5. **Backup MongoDB regularly**:
   ```bash
   # MongoDB Atlas M0 has 7-day automatic backups
   # No action needed
   ```

---

## 📚 File Structure

```
ApexPOS/
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── terraform.tfvars
│   └── userdata.sh
│
├── k8s/
│   ├── namespace.yml
│   ├── backend/
│   │   ├── deployment.yml
│   │   ├── service.yml
│   │   ├── configmap.yml
│   │   └── secrets.yml
│   └── ingress/
│       └── ingress.yml
│
├── scripts/
│   ├── deploy-ec2.sh
│   └── ...
│
├── server/ (backend)
├── client/ (frontend)
└── Jenkinsfile
```

---

**Happy Deploying! 🚀**
