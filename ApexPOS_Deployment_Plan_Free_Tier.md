# ☁️ ApexPOS Zero-Cost (Free Tier) Cloud Deployment Guide

This reference plan shows how to host the production-grade **ApexPOS** platform completely for free, utilizing popular DevOps tools and standard cloud free tiers.

---

## 🗺️ Free Tier Resources Table

| Provider | Service | Allocation | Purpose |
|----------|---------|------------|---------|
| **AWS** | EC2 (t2.micro / t3.micro) | 750 hours / month (1 Year) | Hosts Kubernetes (k3s) Node |
| **AWS** | EBS Block Storage | 30 GB gp3 storage | Database persistence volume |
| **Cloudflare** | DNS & CDN | Always Free | SSL edge termination, DDOS protection |
| **Let's Encrypt** | Certbot | Always Free | SSL certificates generation |
| **GitHub** | Actions & Packages | Unlimited public builds | Docker Registry (GHCR), build pipelines |
| **MongoDB Atlas** | M0 Cluster | 512 MB Storage | Free database hosting (Alternative to local MongoDB) |

---

## 🔒 Section 1: TLS / HTTPS Configuration via Let's Encrypt

Security is vital for POS dashboards. To obtain free, valid SSL certificates from Let's Encrypt:

1. **Install Certbot** on your EC2 host:
   ```bash
   sudo apt-get update
   sudo apt-get install -y certbot python3-certbot-nginx
   ```
2. **Request Certificate**:
   Expose port 80 momentarily and run:
   ```bash
   sudo certbot certonly --standalone -d apexpos.yourdomain.com -m your-email@domain.com --agree-tos --non-interactive
   ```
3. **Mount Certificates inside Kubernetes**:
   Import the generated certificate keys into your Kubernetes cluster as a TLS secret:
   ```bash
   kubectl create secret tls apexpos-tls-secret \
     --key /etc/letsencrypt/live/apexpos.yourdomain.com/privkey.pem \
     --cert /etc/letsencrypt/live/apexpos.yourdomain.com/fullchain.pem \
     -n apexpos
   ```
4. **Automate Certificate Renewal**:
   Add a cronjob to renew the certificates every 60 days:
   ```bash
   # Add to crontab -e
   0 0 1 */2 * certbot renew --post-hook "kubectl create secret tls apexpos-tls-secret --key /etc/letsencrypt/live/apexpos.yourdomain.com/privkey.pem --cert /etc/letsencrypt/live/apexpos.yourdomain.com/fullchain.pem -n apexpos --dry-run=client -o yaml | kubectl apply -f -"
   ```

---

## 🌍 Section 2: DNS and CDN Configuration (Cloudflare)

Cloudflare acts as a global caching proxy and DNS registrar, masking your backend IP:

1. **Point Domain Names**:
   Create two `A` records in your Cloudflare dashboard pointing to your EC2 instance's Public IP address:
   - `apexpos.yourdomain.com` -> IP of EC2
   - `api.apexpos.yourdomain.com` -> IP of EC2
2. **Toggle Cloudflare Proxy**:
   Ensure the cloud icon is colored orange (**Proxied**) to enable CDN speedups and shield the server from direct port scans.
3. **Configure SSL Encryption**:
   - In Cloudflare, navigate to the **SSL/TLS** settings tab.
   - Set encryption mode to **Full** or **Full (Strict)**. This encrypts traffic end-to-end (from Client -> Cloudflare CDN -> EC2 Nginx Ingress).

---

## 🐳 Section 3: Connecting to MongoDB Atlas (Free Tier)

Instead of hosting a stateful MongoDB container inside your 1GB EC2 instance (which can exhaust RAM), it is safer to use a managed MongoDB Atlas database:

1. **Create M0 Cluster**:
   Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), create a free account, and spin up an M0 cluster in the AWS region matching your EC2 node.
2. **Configure Access IP**:
   Under **Network Access**, add `0.0.0.0/0` (secured with username/password) or specifically whitelist the EC2 public elastic IP address.
3. **Update ConfigMap**:
   Change the connection string in `devops-repo/k8s/backend/configmap.yml`:
   ```yaml
   MONGODB_URI: "mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/apexpos?retryWrites=true&w=majority"
   ```
