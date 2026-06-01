# 📋 ApexPOS EC2 t3.micro Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment Phase ⏳

### AWS Account Setup
- [ ] AWS account created
- [ ] Free tier eligibility verified
- [ ] EC2 key pair generated in ap-south-1 region
- [ ] Key saved locally: `/path/to/key.pem`
- [ ] AWS CLI configured: `aws configure`
- [ ] Credentials tested: `aws ec2 describe-instances`

### MongoDB Atlas Setup
- [ ] MongoDB Atlas account created
- [ ] M0 free cluster created
- [ ] Admin user created with strong password
- [ ] Connection string noted
- [ ] IP whitelist ready: 10.0.0.0/16 (will whitelist after EC2 creation)

### Docker Hub Setup
- [ ] Docker Hub account created
- [ ] Local login: `docker login`
- [ ] Credentials saved for automation

### Project Preparation
- [ ] Repository cloned locally
- [ ] Branch checked: `git checkout dev`
- [ ] All files reviewed: `DEPLOYMENT_GUIDE.md`, `DEPLOYMENT_SUMMARY.md`
- [ ] Public IP documented (for SSH access)

---

## Deployment Phase 🚀

### Step 1: Terraform Configuration
- [ ] `terraform/terraform.tfvars` updated with:
  - [ ] `key_pair_name` = Your EC2 key pair name
  - [ ] `admin_ip` = "YOUR_PUBLIC_IP/32"
  - [ ] `alert_email` = your-email@example.com
  - [ ] `aws_region` = ap-south-1
  - [ ] `environment` = prod
- [ ] File validated: `terraform validate`
- [ ] Plan reviewed: `terraform plan` (check for expected resources)

### Step 2: Infrastructure Deployment
- [ ] Terraform initialized: `terraform init`
- [ ] Infrastructure deployed: `terraform apply`
  - [ ] Confirm: "Do you want to perform these actions? (yes/no)" → yes
- [ ] Deployment complete: EC2 instance created
- [ ] Outputs noted:
  - [ ] EC2 Public IP
  - [ ] Elastic IP
  - [ ] Security Group ID
- [ ] ⏳ Wait 2-3 minutes for userdata.sh to complete

### Step 3: EC2 Connectivity Verification
- [ ] SSH connection successful: `ssh -i /path/to/key.pem ubuntu@ELASTIC_IP`
- [ ] Docker verified: `docker ps` (should work)
- [ ] k3s verified: `kubectl get nodes` (should show 1 node)
- [ ] Swap verified: `swapon --show` (should show 2GB)
- [ ] kubeconfig available: `ls -la ~/.kube/config`

### Step 4: Environment Configuration
- [ ] MongoDB URI obtained from Atlas
- [ ] EC2 Elastic IP noted
- [ ] JWT secret generated: `openssl rand -hex 32`

**On EC2**:
- [ ] Repository cloned or pulled: `git pull origin dev`
- [ ] `server/.env` updated:
  - [ ] `PORT=5000`
  - [ ] `NODE_ENV=production`
  - [ ] `MONGODB_URI=mongodb+srv://...`
  - [ ] `JWT_SECRET=your-generated-secret`
  - [ ] `ALLOWED_ORIGINS=http://ELASTIC_IP,https://frontend-url`
- [ ] `client/.env` updated:
  - [ ] `REACT_APP_API_URL=http://ELASTIC_IP:30500`
- [ ] `k8s/backend/secrets.yml` updated:
  - [ ] `MONGODB_URI` value
  - [ ] `JWT_SECRET` value
- [ ] MongoDB Atlas IP whitelist updated: add 10.0.0.0/16

### Step 5: Docker Image Building
**Option A: Build locally and push**
- [ ] Login to Docker: `docker login`
- [ ] Backend built: `docker build -t username/apexpos-backend:latest ./server`
- [ ] Backend pushed: `docker push username/apexpos-backend:latest`
- [ ] Frontend built: `docker build -t username/apexpos-frontend:latest ./client`
- [ ] Frontend pushed: `docker push username/apexpos-frontend:latest`

**Option B: Build on EC2**
- [ ] On EC2: `export DOCKER_REGISTRY=your-username`
- [ ] Build initiated: `./scripts/deploy-ec2.sh build --push`
- [ ] Images verified on Docker Hub

### Step 6: Kubernetes Secrets Setup
**On EC2**:
- [ ] Kubeconfig exported: `export KUBECONFIG=/etc/rancher/k3s/k3s.yaml`
- [ ] Namespace created: `kubectl apply -f k8s/namespace.yml`
- [ ] Secrets created: `kubectl apply -f k8s/backend/secrets.yml`
- [ ] Secrets verified: `kubectl get secrets -n apexpos`

### Step 7: Kubernetes Deployment
**On EC2**:
- [ ] ConfigMap applied: `kubectl apply -f k8s/backend/configmap.yml`
- [ ] Deployment applied: `kubectl apply -f k8s/backend/deployment.yml`
- [ ] Service applied: `kubectl apply -f k8s/backend/service.yml`
- [ ] Ingress applied: `kubectl apply -f k8s/ingress/ingress.yml`
- [ ] Or use script: `./scripts/deploy-ec2.sh deploy`

### Step 8: Backend Verification
**On EC2**:
- [ ] Pods running: `kubectl get pods -n apexpos`
- [ ] Pod status ready: Pod shows "1/1 Running"
- [ ] Logs checked: `kubectl logs -f deployment/apexpos-backend -n apexpos`
- [ ] Health check: `curl http://localhost:5000/`
- [ ] External access: `curl http://ELASTIC_IP:30500/`
- [ ] Service info: `kubectl get svc -n apexpos`
- [ ] Rollout status: `kubectl rollout status deployment/apexpos-backend -n apexpos`

### Step 9: MongoDB Connection Verification
**On EC2**:
- [ ] Test connection in logs: Check for "MongoDB connected" message
- [ ] API endpoints working: Test a real endpoint (e.g., /api/products)
- [ ] Data insertion working: Check CloudWatch logs for successful operations

### Step 10: Frontend Deployment (Optional)
**Option A: Vercel Deployment**
- [ ] GitHub connected to Vercel
- [ ] Environment variable set: `REACT_APP_API_URL=http://ELASTIC_IP:30500`
- [ ] Frontend deployed
- [ ] Frontend accessible and calling backend

**Option B: k3s Deployment**
- [ ] Nginx ingress verified: `kubectl get ingress -n apexpos`
- [ ] Frontend pod created and running
- [ ] Frontend accessible at domain

### Step 11: Jenkins Setup (Optional but Recommended)
**On EC2**:
- [ ] Jenkins container started:
  ```bash
  docker run -d --restart unless-stopped \
    -p 8080:8080 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    jenkins/jenkins:lts
  ```
- [ ] Initial password obtained: `docker logs jenkins 2>&1 | grep -i password`
- [ ] Jenkins UI accessed: http://ELASTIC_IP:8080
- [ ] Admin user created
- [ ] GitHub credentials added
- [ ] Jenkinsfile configured for webhook
- [ ] GitHub webhook created: `http://ELASTIC_IP:8080/github-webhook/`

### Step 12: CloudWatch Monitoring
- [ ] SNS email subscription confirmed (check email)
- [ ] CloudWatch logs group exists: `/apexpos/server`
- [ ] Logs flowing: Check AWS Console
- [ ] Alarms created:
  - [ ] CPU alarm (>85%)
  - [ ] Memory alarm (optional)
- [ ] Email alerts working (trigger test alarm)

---

## Post-Deployment Phase ✅

### Security Hardening
- [ ] SSH access restricted: Update `admin_ip` in terraform.tfvars to YOUR_IP/32
- [ ] Run: `terraform apply`
- [ ] Test SSH still works from YOUR_IP
- [ ] Generate new JWT_SECRET
- [ ] Update secrets: `kubectl edit secret backend-secrets -n apexpos`
- [ ] Rotate MongoDB password if needed
- [ ] Review CloudTrail logs (in CloudWatch)

### Domain & SSL Setup (Optional)
- [ ] Domain purchased or registered
- [ ] Domain nameservers updated to Cloudflare
- [ ] Cloudflare A record: Points to ELASTIC_IP
- [ ] SSL certificate obtained (Let's Encrypt via cert-manager)
- [ ] Ingress updated with domain name
- [ ] HTTPS working

### Backup & Disaster Recovery
- [ ] MongoDB backups enabled (7-day retention free on Atlas)
- [ ] Terraform state backed up: `cp terraform.tfstate terraform.tfstate.backup`
- [ ] kubeconfig backed up locally
- [ ] EC2 key pair stored securely (encrypted backup)

### Documentation
- [ ] Deployment guide saved to wiki/docs
- [ ] Architecture diagram created
- [ ] Runbook created for common operations:
  - [ ] How to scale pod replicas
  - [ ] How to update application
  - [ ] How to backup/restore data
  - [ ] How to troubleshoot issues

### Monitoring & Alerts
- [ ] CloudWatch dashboard created
- [ ] Key metrics monitored:
  - [ ] CPU utilization
  - [ ] Memory usage
  - [ ] Network traffic
  - [ ] Pod restart count
- [ ] Alert thresholds reviewed and adjusted
- [ ] On-call rotation setup (if team)

---

## Verification Checklist ✅

### Infrastructure
- [ ] EC2 instance running
- [ ] Elastic IP assigned
- [ ] Security group allowing correct ports
- [ ] VPC properly configured
- [ ] Internet Gateway attached

### Kubernetes
- [ ] k3s cluster healthy: `kubectl get nodes`
- [ ] All pods running: `kubectl get pods -A`
- [ ] Services accessible: `kubectl get svc -n apexpos`
- [ ] Storage working (if using PVC)
- [ ] Ingress routing correctly

### Application
- [ ] Backend API responding to health checks
- [ ] API endpoints functional
- [ ] Database connected and seeded
- [ ] Frontend can reach backend (CORS configured)
- [ ] WebSocket connections working (if used)

### Monitoring
- [ ] Logs appearing in CloudWatch
- [ ] Metrics showing in CloudWatch Dashboard
- [ ] Alarms configured and active
- [ ] SNS notifications working
- [ ] Log retention policy set

### Performance
- [ ] Response times acceptable
- [ ] No memory leaks (check pod memory over time)
- [ ] CPU usage stable
- [ ] No 5xx errors in logs
- [ ] Request throughput as expected

---

## Troubleshooting Reference

| Issue | Check |
|-------|-------|
| Pod won't start | `kubectl describe pod <pod-name> -n apexpos` |
| MongoDB connection fails | Whitelist IP, verify credentials, check connection string |
| High memory usage | Check pod memory limits, review application code |
| Slow deployments | t3.micro limitation, expected on first deploy |
| SSH access denied | Check security group, update admin_ip in Terraform |
| CloudWatch logs missing | Check IAM role, verify CloudWatch agent running |
| Frontend can't reach backend | Check CORS, update ALLOWED_ORIGINS, test endpoint |

---

## Timeline Estimate

| Phase | Duration | Total |
|-------|----------|-------|
| Pre-deployment prep | 30 min | 30 min |
| Terraform deploy | 30 min | 60 min |
| Configuration & build | 20 min | 80 min |
| k8s deployment | 15 min | 95 min |
| Verification | 10 min | 105 min |

**Total: ~2 hours for complete deployment**

(Faster if building images on local machine and pushing to Docker Hub)

---

## Important Notes

⚠️ **Remember**:
- Keep `terraform.tfstate` file safe - it's needed to manage infrastructure
- Change `admin_ip` to YOUR_IP/32 after deployment for security
- Update JWT_SECRET and MongoDB passwords after initial deployment
- Monitor AWS Billing console to stay within free tier
- t3.micro is limited - expected slower builds/deployments
- Free tier is 12 months - plan for upgrade or migration after

✅ **After 12 months**:
- Option 1: Upgrade to t3.small/medium (~$15-30/month)
- Option 2: Migrate to managed services (ECS, RDS)
- Option 3: Continue t3.micro with minimal cost (~$12/month)

---

**Good luck with your deployment! 🚀**

Last Updated: June 1, 2024
