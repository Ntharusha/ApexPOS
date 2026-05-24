# ApexPOS — Implementation Plan: EC2 + k3s (Free Tier) with Jenkins CI & Argo CD

> **Purpose:** Step-by-step execution guide to deploy ApexPOS on a single AWS free-tier EC2 instance running k3s, with **Jenkins handling CI** (build/test/push) and **Argo CD handling CD** (deploy from Git).  
> **Companion doc:** [ApexPOS_Deployment_Plan_Free_Tier.md](./ApexPOS_Deployment_Plan_Free_Tier.md) (reference details, manifests, troubleshooting).  
> **Live checklist:** [DEPLOY_STATUS.md](./DEPLOY_STATUS.md) — what’s done in repo vs what you run on AWS.

### Repo prep — done
Phase 0, Jenkinsfile GitOps, `userdata.sh` (k3s), helper scripts under `scripts/`, Argo CD Application manifest.

---

## 1. Target architecture

```
                    ┌─────────────────────────────────────────┐
                    │           GitHub (Ntharusha/ApexPOS)     │
                    │  • source code                           │
                    │  • k8s/ manifests (GitOps source of truth)│
                    └───────────────┬─────────────────────────┘
                                    │
              push main             │ watch k8s/
                    ┌───────────────▼───────────────┐
                    │  Jenkins (CI) on EC2 :8080    │
                    │  1. lint + build frontend     │
                    │  2. build + push Docker image │
                    │  3. bump image tag in git     │──┐
                    └───────────────┬───────────────┘  │
                                    │                  │
                    ┌───────────────▼───────────────┐  │
                    │  Docker Hub (free)            │  │
                    │  ntharusha/apexpos-backend    │  │
                    └───────────────┬───────────────┘  │
                                    │                  │
┌───────────────────────────────────▼──────────────────▼──┐
│  EC2 t3.micro (750 hrs/mo free) + 2GB swap              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ k3s (Kubernetes)                                   │ │
│  │  • apexpos/backend Deployment                      │ │
│  │  • ingress-nginx + cert-manager (optional)         │ │
│  │  • Argo CD → syncs k8s/ from Git                   │ │
│  └────────────────────────────────────────────────────┘ │
│  Jenkins container (host Docker, not inside k3s)      │
└───────────────────────────┬─────────────────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │ MongoDB Atlas M0 (free)   │
              └───────────────────────────┘

┌─────────────────────────┐
│ Vercel Hobby (frontend) │──► VITE_API_URL → API ingress / NodePort
└─────────────────────────┘
```

### CI vs CD responsibilities

| Tool | Role | Does | Does NOT |
|------|------|------|----------|
| **Jenkins** | **CI** | Checkout, lint, build frontend, build/push backend image, commit new image tag to `k8s/` | Direct `kubectl apply` / `kubectl set image` in production |
| **Argo CD** | **CD** | Watch Git `k8s/`, sync to cluster, self-heal, rollback via Git | Build Docker images |
| **Terraform** | **IaC** | VPC, EC2, EIP, SG, CloudWatch (one-time / infra changes) | Application deploys |

> **Current repo gap:** `Jenkinsfile` still runs `kubectl set image` (imperative deploy). Phase 7 removes that so Argo CD owns deploys.

---

## 2. Prerequisites checklist

Complete before Phase 1.

| # | Item | Action |
|---|------|--------|
| 1 | AWS account | Free tier eligible, billing alerts on |
| 2 | EC2 key pair | Create `apexpos-key` in AWS Console, save `.pem` |
| 3 | MongoDB Atlas M0 | Cluster in `ap-south-1`, user `apexpos_app`, connection string saved |
| 4 | Docker Hub | Account + repo `ntharusha/apexpos-backend` (or your username) |
| 5 | GitHub repo | `Ntharusha/ApexPOS`, branch `main` |
| 6 | GitHub PAT | Scopes: `repo` (for Jenkins to push image-tag commits) |
| 7 | Domain (optional) | Cloudflare free DNS → `api.yourdomain.com` |
| 8 | Local tools | `terraform`, `kubectl`, `aws` CLI, `docker`, `helm` |
| 9 | Vercel account | For frontend (Phase 9) |

**Secrets to prepare (never commit):**

```bash
# server/.env (local dev only)
MONGODB_URI=mongodb+srv://...
JWT_SECRET=$(openssl rand -hex 32)

# K8s (apply on cluster once)
kubectl create secret generic backend-secrets -n apexpos \
  --from-literal=MONGODB_URI='mongodb+srv://...' \
  --from-literal=JWT_SECRET='...'
```

---

## 3. Implementation phases

### Phase 0 — Repo & security prep (Day 0)

| Step | Task | Verify |
|------|------|--------|
| 0.1 | Remove hardcoded DB credentials from `server/seed.js`, `checkDb.js`, `fixIndex.js` | No `mongodb+srv://` with password in Git |
| 0.2 | Set strong `JWT_SECRET`; remove demo `admin/admin` login bypass for production | Login requires real API |
| 0.3 | Align env name: use `MONGODB_URI` everywhere (README currently says `MONGO_URI`) | Docs match `server/server.js` |
| 0.4 | Confirm `k8s/` manifests exist | `namespace`, `deployment`, `service`, `configmap`, `ingress` |
| 0.5 | Add `k8s/argocd/application.yml` (see Section 8) | File in repo |

**Exit criteria:** `client` lint + build pass; `server` Dockerfile builds locally.

---

### Phase 1 — MongoDB Atlas M0 (Day 1)

| Step | Task | Verify |
|------|------|--------|
| 1.1 | Create M0 cluster (AWS `ap-south-1`) | Atlas shows **Active** |
| 1.2 | DB user `apexpos_app` + strong password | User created |
| 1.3 | Network access: `0.0.0.0/0` (required for changing EC2 IP on free tier) | IP allowlist saved |
| 1.4 | Database name `apexpos` | Connection string ends with `/apexpos?...` |
| 1.5 | Test from local machine | `mongosh "<uri>"` connects |

**Exit criteria:** Connection string stored in password manager.

---

### Phase 2 — Container images (Day 1)

| Step | Task | Verify |
|------|------|--------|
| 2.1 | Build backend image locally | `docker build -t apexpos-backend:test ./server` |
| 2.2 | Run container with env vars | `curl localhost:5000/` returns API message |
| 2.3 | Push to Docker Hub | `docker push <user>/apexpos-backend:1` |
| 2.4 | Update `k8s/backend/deployment.yml` `image:` to your repo | Tag matches Hub |

**Exit criteria:** Image visible on Docker Hub; pull works from EC2.

---

### Phase 3 — AWS infrastructure with Terraform (Day 2)

| Step | Task | Verify |
|------|------|--------|
| 3.1 | Edit `terraform/terraform.tfvars` | `admin_ip = "YOUR_IP/32"` (not `0.0.0.0/0`) |
| 3.2 | Set `alert_email`, `key_pair_name` | tfvars complete |
| 3.3 | **Update `terraform/userdata.sh`** to install k3s + swap (see Section 6) | Script installs k3s, not only Docker |
| 3.4 | `cd terraform && terraform init && terraform plan` | Plan shows 1 EC2, VPC, EIP |
| 3.5 | `terraform apply` | Outputs: `server_public_ip` |
| 3.6 | SSH to instance | `ssh -i apexpos-key.pem ubuntu@<EIP>` works |

**Exit criteria:** EC2 running; `kubectl get nodes` works on the server.

---

### Phase 4 — k3s cluster bootstrap (Day 2–3)

Run on EC2 (after userdata or `scripts/bootstrap-ec2-k3s.sh`).

| Step | Task | Command / notes |
|------|------|-----------------|
| 4.1 | Verify k3s | `sudo k3s kubectl get nodes` |
| 4.2 | kubeconfig for `ubuntu` | Copy `/etc/rancher/k3s/k3s.yaml` → `~/.kube/config` |
| 4.3 | Create namespace | `kubectl apply -f k8s/namespace.yml` |
| 4.4 | Create secrets | `kubectl create secret generic backend-secrets ...` |
| 4.5 | Apply ConfigMap | `kubectl apply -f k8s/backend/configmap.yml` |
| 4.6 | Install ingress-nginx | Bare-metal manifest (see companion doc §7.2) |
| 4.7 | Expose backend (initial) | `kubectl apply -f k8s/backend/` + `k8s/ingress/` |
| 4.8 | Smoke test NodePort | `curl http://localhost:30500/` |

**Resource limits (1 vCPU / 1 GB RAM):**

| Component | Memory request | Notes |
|-----------|----------------|-------|
| k3s system | ~300 MB | Fixed overhead |
| ingress-nginx | ~100 MB | One controller pod |
| apexpos-backend | 128–256 Mi | Already in deployment.yml |
| Argo CD (minimal) | ~200–300 MB | Install after backend works |
| Jenkins (host Docker) | ~512 MB | **Not** inside k3s on free tier |

**Exit criteria:** Backend pod `Running`; NodePort `30500` returns health text.

---

### Phase 5 — Argo CD GitOps (Day 3)

| Step | Task | Verify |
|------|------|--------|
| 5.1 | Install Argo CD | `kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml` |
| 5.2 | Wait for server pod | `kubectl wait -n argocd --for=condition=ready pod -l app.kubernetes.io/name=argocd-server --timeout=300s` |
| 5.3 | Expose UI (NodePort) | Patch `argocd-server` → NodePort `30080` |
| 5.4 | Get admin password | `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' \| base64 -d` |
| 5.5 | Open firewall / SG | Allow TCP `30080` from your IP (add to Terraform SG if needed) |
| 5.6 | Register Git repo | Argo CD UI → Settings → Repositories → GitHub HTTPS + PAT |
| 5.7 | Apply Application | `kubectl apply -f k8s/argocd/application.yml` |
| 5.8 | Sync app | UI shows **Synced** / **Healthy** |

**GitOps rules:**

- All changes to running workloads go through `k8s/` in Git.
- Argo CD `syncPolicy.automated` enabled only after first manual sync succeeds.
- Do not run `kubectl apply` for app resources after Argo CD owns them (avoid drift).

**Exit criteria:** Argo CD app `apexpos` green; cluster matches Git.

---

### Phase 6 — Jenkins CI on EC2 (Day 4)

**Recommendation:** Run Jenkins in **Docker on the host** (port `8080`, already in Terraform SG), not as a Helm chart inside k3s — saves ~256 MB RAM on a 1 GB instance.

| Step | Task | Verify |
|------|------|--------|
| 6.1 | Run Jenkins container | See Section 7.1 |
| 6.2 | Unlock Jenkins | Initial admin password from container logs |
| 6.3 | Install plugins | Git, Pipeline, GitHub, Docker Pipeline, Credentials |
| 6.4 | Add credentials | `dockerhub-credentials`, `github-pat` (for git push) |
| 6.5 | Mount Docker socket | Jenkins agent can `docker build` |
| 6.6 | Mount kubeconfig (optional) | Only if you keep smoke-test stage hitting NodePort |
| 6.7 | Create Pipeline job | SCM → Git → `Jenkinsfile` on `main` |
| 6.8 | GitHub webhook | Push to `main` triggers build |

**Exit criteria:** Manual build succeeds through **Push to Docker Hub** stage.

---

### Phase 7 — Wire Jenkins → Git → Argo CD (Day 4–5)

Replace imperative deploy in `Jenkinsfile` with GitOps bump.

#### Target pipeline flow

```
git push main
    → Jenkins: checkout
    → Jenkins: lint + build client
    → Jenkins: docker build + push :BUILD_NUMBER + :latest
    → Jenkins: sed k8s/backend/deployment.yml image tag
    → Jenkins: git commit + push [ci] image BUILD_NUMBER
    → Argo CD: detects commit → sync → rolling update
    → Jenkins: curl smoke test (NodePort or ingress URL)
```

#### Jenkinsfile changes (summary)

| Remove | Add |
|--------|-----|
| `stage('Deploy to k3s')` with `kubectl set image` | `stage('Bump GitOps Manifest')` — commit image tag |
| — | `git push` using `github-pat` credential |
| Smoke test `localhost:30500` | Same, or `https://api.yourdomain.com/` |

Example bump stage (conceptual):

```groovy
stage('Bump GitOps Manifest') {
    when { branch 'main' }
    steps {
        sh """
            sed -i 's|image: .*apexpos-backend:.*|image: ${DOCKER_IMAGE}:${BUILD_NUMBER}|' k8s/backend/deployment.yml
            git config user.email ci@apexpos.local
            git config user.name Jenkins
            git add k8s/backend/deployment.yml
            git diff --staged --quiet || git commit -m '[ci] backend image ${BUILD_NUMBER}'
            git push origin HEAD:main
        """
    }
}
```

> Use Jenkins **SSH key** or **username/password (PAT)** credential for `git push`. Protect `main` with branch rules if needed.

**Alternative (simpler MVP):** Keep `image: ...:latest` and `imagePullPolicy: Always`; Jenkins only pushes Docker; Argo CD **Refresh** via API or manual — less pure GitOps, OK for demos.

**Exit criteria:** Push to `main` → new image on Hub → Git commit → Argo CD deploys → pod uses new tag.

---

### Phase 8 — Ingress, DNS & TLS (Day 5–6)

| Step | Task | Verify |
|------|------|--------|
| 8.1 | Point DNS `api.yourdomain.com` → EC2 Elastic IP | `dig api.yourdomain.com` |
| 8.2 | Update `k8s/ingress/ingress.yml` host | Matches your domain |
| 8.3 | Install cert-manager + ClusterIssuer | Let's Encrypt HTTP-01 |
| 8.4 | Update `k8s/backend/configmap.yml` `ALLOWED_ORIGINS` | Vercel URL + custom domain |
| 8.5 | Commit; Argo CD syncs | `curl https://api.yourdomain.com/` |

**Exit criteria:** HTTPS API works; CORS allows frontend origin.

---

### Phase 9 — Frontend on Vercel (Day 6)

| Step | Task | Verify |
|------|------|--------|
| 9.1 | Import repo; root `client/` | Build succeeds |
| 9.2 | Env `VITE_API_URL` | `https://api.yourdomain.com/api` |
| 9.3 | Deploy | Login + dashboard load data |
| 9.4 | Update Atlas / backend CORS if needed | No browser CORS errors |

**Exit criteria:** Production SPA talks to EC2/k3s API.

---

### Phase 10 — Monitoring & hardening (Day 7+)

| Step | Task |
|------|------|
| 10.1 | Confirm CloudWatch alarms from Terraform (CPU > 85%) |
| 10.2 | Install CloudWatch agent on EC2 (optional log shipping) |
| 10.3 | Rotate JWT + DB password; store only in K8s secrets |
| 10.4 | Restrict SG: remove public `5000` after ingress works |
| 10.5 | Argo CD: change admin password, disable insecure UI in prod |
| 10.6 | Enable automated sync + self-heal on Argo app |

---

## 4. Repository layout (target)

```
ApexPOS/
├── Jenkinsfile                 # CI only (build, push, git bump)
├── IMPLEMENTATION_PLAN_EC2_K8S.md   # this file
├── ApexPOS_Deployment_Plan_Free_Tier.md
├── terraform/
│   ├── main.tf
│   ├── userdata.sh             # must install k3s + swap
│   └── terraform.tfvars        # gitignored
├── scripts/
│   └── bootstrap-ec2-k3s.sh    # post-SSH setup helper
├── k8s/
│   ├── namespace.yml
│   ├── argocd/
│   │   └── application.yml
│   ├── backend/
│   │   ├── deployment.yml      # image tag = GitOps trigger
│   │   ├── service.yml
│   │   └── configmap.yml
│   └── ingress/
│       └── ingress.yml
├── server/                     # Docker image context
└── client/                     # Vercel deploy
```

---

## 5. Jenkins credentials matrix

| Jenkins credential ID | Type | Used for |
|----------------------|------|----------|
| `dockerhub-credentials` | Username/password | `docker login` + push |
| `github-pat` | Secret text | `git push` image-tag commits |
| `kubeconfig` (optional) | Secret file | Smoke tests only |

---

## 6. EC2 bootstrap (fix `userdata.sh`)

Current `terraform/userdata.sh` only installs Docker. **Extend it** before `terraform apply`:

```bash
#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

apt-get update && apt-get upgrade -y

# Swap (required for k3s + Argo CD on 1GB RAM)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Docker (for Jenkins CI builds)
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu

# k3s (single-node cluster)
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--write-kubeconfig-mode 644" sh -

# kubectl for ubuntu
mkdir -p /home/ubuntu/.kube
cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
chown -R ubuntu:ubuntu /home/ubuntu/.kube

echo "Bootstrap complete: Docker + k3s ready"
```

Add Terraform SG ingress for Argo CD if using NodePort `30080`:

```hcl
ingress {
  from_port   = 30080
  to_port     = 30080
  protocol    = "tcp"
  cidr_blocks = [var.admin_ip]
}
```

---

## 7. Jenkins on host Docker (recommended)

```bash
# On EC2 as ubuntu
docker volume create jenkins_home

docker run -d --name jenkins \
  --restart unless-stopped \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /home/ubuntu/.kube:/var/jenkins_home/.kube:ro \
  -u root \
  jenkins/jenkins:lts-jdk17

# Initial password
docker logs jenkins 2>&1 | grep -A2 "password"
```

Access: `http://<EIP>:8080` (matches `terraform/outputs.tf` `jenkins_url`).

---

## 8. Argo CD Application manifest

Create `k8s/argocd/application.yml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: apexpos
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/Ntharusha/ApexPOS.git
    targetRevision: main
    path: k8s
    directory:
      recurse: true
      exclude: 'argocd/*'
  destination:
    server: https://kubernetes.default.svc
    namespace: apexpos
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

> `exclude: 'argocd/*'` prevents Argo CD from trying to manage its own Application CR as a child resource in a loop.

---

## 9. End-to-end verification checklist

| # | Check | Expected |
|---|--------|----------|
| 1 | `terraform output server_public_ip` | Valid EIP |
| 2 | `kubectl get nodes` | Ready |
| 3 | `kubectl get pods -n apexpos` | backend Running |
| 4 | Argo CD UI | App Synced & Healthy |
| 5 | `curl http://<EIP>:30500/` | `ApexPOS API Server Running` |
| 6 | Jenkins build on push | Green pipeline |
| 7 | Docker Hub | New tag after build |
| 8 | Git commit `[ci]` | `deployment.yml` image updated |
| 9 | Argo CD history | Sync after Jenkins push |
| 10 | Vercel app | Dashboard loads API data |
| 11 | WebSocket / real-time | POS sync works (ingress WS annotations) |

---

## 10. Estimated timeline

| Phase | Duration | Depends on |
|-------|----------|------------|
| 0 – Repo prep | 2–4 hours | — |
| 1 – Atlas | 1 hour | — |
| 2 – Docker images | 1–2 hours | Phase 1 |
| 3 – Terraform EC2 | 2–3 hours | AWS account |
| 4 – k3s bootstrap | 3–4 hours | Phase 3 |
| 5 – Argo CD | 2–3 hours | Phase 4 |
| 6 – Jenkins CI | 3–4 hours | Phase 3 |
| 7 – CI→GitOps wire | 2–4 hours | Phases 5–6 |
| 8 – DNS/TLS | 2–4 hours | Domain |
| 9 – Vercel | 1–2 hours | Phase 8 (or NodePort temp) |
| 10 – Hardening | Ongoing | All |

**Total:** ~4–7 days part-time for first production-like deploy.

---

## 11. Free-tier risks & mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 1 GB RAM OOM | Pods evicted | 2 GB swap; Jenkins on host; 1 backend replica |
| 30 GB disk full | Build fails | `docker image prune` in Jenkins `post`; log rotation |
| Atlas 512 MB / 100 conn | DB errors | Index hygiene; connection pooling later |
| EC2 IP change without EIP | DNS breaks | **Always attach Elastic IP** (Terraform does this) |
| Jenkins + Argo CD drift | Double deploy | Remove `kubectl set image` from Jenkinsfile |
| Secrets in Git | Compromise | Only K8s Secrets / Jenkins credentials |
| `admin/admin` demo login | Security | Disable before go-live |

---

## 12. What to do next (ordered)

1. Fix `terraform/userdata.sh` (Section 6) and restrict `admin_ip`.
2. Apply Terraform → SSH → complete Phase 4 bootstrap.
3. Create K8s secrets + apply manifests → confirm NodePort health.
4. Install Argo CD → apply `k8s/argocd/application.yml`.
5. Start Jenkins (Section 7) → configure credentials → run pipeline without deploy stage.
6. Update `Jenkinsfile` for GitOps bump (Phase 7) → full automated loop.
7. Deploy frontend to Vercel with correct `VITE_API_URL`.
8. Add DNS/TLS when ready.

For deep-dive commands (ingress install, cert-manager, CloudWatch), continue with [ApexPOS_Deployment_Plan_Free_Tier.md](./ApexPOS_Deployment_Plan_Free_Tier.md).
