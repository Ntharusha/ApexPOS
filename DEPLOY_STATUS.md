# Deployment status

Track progress for [IMPLEMENTATION_PLAN_EC2_K8S.md](./IMPLEMENTATION_PLAN_EC2_K8S.md).

## Completed in repo (automated)

- [x] **Phase 0** — Removed hardcoded MongoDB credentials; JWT required in production; demo login only in dev
- [x] **Phase 0** — `server/env.example`, `client/env.example`; README uses `MONGODB_URI`
- [x] **Terraform** — `userdata.sh` installs swap, Docker, k3s; SG for Argo CD `30080` + NodePort `30500`
- [x] **Jenkinsfile** — GitOps bump (no `kubectl set image`); expects `github-pat` credential
- [x] **k8s** — Argo CD Application manifest; deployment image tag `tharusha69/apexpos-backend:1`
- [x] **Scripts** — `bootstrap-ec2-k3s.sh`, `install-jenkins.sh`, `install-argocd.sh`, `setup-k8s-app.sh`

## Your manual steps (in order)

### 1. MongoDB Atlas (Phase 1)
- [ ] Create M0 cluster → save `MONGODB_URI`
- [ ] Network access `0.0.0.0/0` (or EC2 Elastic IP only)

### 2. Docker Hub (Phase 2)
- [ ] Push first image: `docker build -t tharusha69/apexpos-backend:1 ./server && docker push tharusha69/apexpos-backend:1`

### 3. AWS EC2 (Phase 3)
```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Edit: key_pair_name, admin_ip (YOUR_IP/32), alert_email

cd terraform
terraform init
terraform plan
terraform apply
```
- [ ] Note outputs: `server_public_ip`, `jenkins_url`, `argocd_url`

### 4. On EC2 via SSH (Phases 4–6)
```bash
ssh -i apexpos-key.pem ubuntu@<EIP>

# Optional: ingress if not in userdata follow-up
sudo bash /path/to/repo/scripts/bootstrap-ec2-k3s.sh

# K8s secrets (use your Atlas URI + JWT)
kubectl create secret generic backend-secrets -n apexpos \
  --from-literal=MONGODB_URI='mongodb+srv://...' \
  --from-literal=JWT_SECRET="$(openssl rand -hex 32)"

# App manifests
bash scripts/setup-k8s-app.sh

# Argo CD
bash scripts/install-argocd.sh
kubectl apply -f k8s/argocd/application.yml

# Jenkins
sudo bash scripts/install-jenkins.sh
```

### 5. Jenkins UI (`http://<EIP>:8080`)
- [ ] Credentials: `dockerhub-credentials`, `github-pat` (GitHub PAT with `repo` scope)
- [ ] Pipeline job → SCM → `Jenkinsfile` on `main`

### 6. Vercel (Phase 9)
- [ ] Root `client/`, env `VITE_API_URL=https://api.yourdomain.com/api` (or `http://<EIP>:30500/api` interim)

---

**Next command for you:** complete Atlas + `terraform apply`, then SSH and run the scripts above.
