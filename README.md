# 🚀 ApexPOS SaaS 

**ApexPOS** is a modern, real-time, cloud-based Point of Sale (POS) and business management platform. Designed as a comprehensive SaaS solution, it scales effortlessly from single retail stores to multi-branch businesses and hospitality environments.

Built with performance, real-time synchronization, and a premium user experience in mind.

---

## ✨ Key Features

- **⚡ Real-Time Synchronization:** Seamless, instant updates across multiple devices and terminals using WebSockets (Socket.IO).
- **📊 Comprehensive Dashboard & Analytics:** Visualize sales trends, track KPIs, and monitor business health in real-time using interactive charts (Recharts).
- **🌍 Multilingual Support:** Out-of-the-box internationalization (i18n) for global deployment and diverse staff.
- **🖨️ Hardware Integration:** Built-in support for receipt printing and barcode scanning.
- **🔐 Secure & Role-Based Access:** Robust JWT-based authentication and shift management to track cashier sessions securely.

## 🛠️ Specialized Modules

ApexPOS goes beyond basic sales, offering industry-specific modules to run your entire operation:
- **🛒 Retail Core:** Product variants, categories, inventory management, and fast-checkout POS interface.
- **🍽️ Hospitality:** Table management, kitchen order routing, and specialized dining workflows.
- **🔧 Services & Repairs:** Track customer device repairs, status updates, and service billing.
- **🚚 Delivery Management:** Dispatch orders, track delivery statuses, and manage driver workflows.
- **💳 Hire Purchase (HP) & Installments:** Manage customer installment plans, tracking, and liabilities.
- **♻️ Trade-ins:** Handle customer product trade-ins and automatically update inventory.
- **💸 Financials:** Expense tracking, liabilities management, and detailed end-of-day reporting.

---

## 💻 Tech Stack

**Frontend (Client)**
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Framer Motion (for fluid micro-animations)
- **State Management:** Zustand
- **Routing:** React Router v7
- **Real-Time:** Socket.IO Client
- **Data Visualization:** Recharts
- **Internationalization:** `react-i18next`

**Backend (Server)**a
- **Environment:** Node.js + Express.js
- **Database:** MongoDB (with Mongoose ORM)
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **Real-Time Engine:** Socket.IO
- **Security:** CORS, Environment variables

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local instance or Atlas Cluster)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ApexPOS_SaaS_Main.git
cd ApexPOS_SaaS_Main
```

### 2. Backend Setup
```bash
cd server
npm install
```
Copy `server/env.example` to `server/.env` and edit:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/apexpos
JWT_SECRET=your_super_secret_key
ALLOWED_ORIGINS=http://localhost:5173
```
Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```
Copy `client/env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

---

## ☁️ DevOps Architecture & Production Deployment

For cloud and production deployments, we follow modern DevOps and GitOps methodologies to ensure high availability, security, and automated continuous delivery.

### 🏛️ DevOps Pipeline & GitOps Flow

```mermaid
graph LR
    Dev[Developer] -->|Push Code| GitHub[GitHub Repo]
    
    subgraph CI/CD (GitHub Actions)
        GitHub -->|Trigger CI| Actions[GitHub Actions]
        Actions -->|Lint & Build FE| FE_Build[Docker Build Frontend]
        Actions -->|Test & Build BE| BE_Build[Docker Build Backend]
        FE_Build -->|Push to| GHCR[GitHub Container Registry]
        BE_Build -->|Push to| GHCR
    end
    
    subgraph Continuous Delivery (Argo CD)
        GHCR -->|Detect Tag| ArgoCD[Argo CD]
        ArgoCD -->|Sync State| K3s[k3s Cluster]
    end
```

### 💰 Free-Tier Production Cost Optimization

To host this project completely for free during the staging/testing phase, we utilize the following free-tier cloud configurations:

| Service | Free Tier Details | Duration | Purpose |
|---------|------------------|----------|---------|
| **AWS EC2** | 750 hrs/mo of t2.micro/t3.micro | 12 months | Cluster Node Host |
| **AWS EBS** | 30 GB of gp3 storage | 12 months | Persistence Storage |
| **MongoDB Atlas** | M0 Cluster (512 MB, Shared) | Always free | Managed Database |
| **Let's Encrypt** | Certbot TLS Certificates | Always Free | SSL Encryption |
| **Cloudflare** | DNS & CDN Proxy | Always free | Global Edge Security |
| **GitHub Packages** | Container Registry (GHCR) | Always free | Image Storage |

### 📖 Deployment Documentation

Detailed setup guides and orchestration manifests are located here:
👉 **[Phased Kubernetes Implementation Plan](./IMPLEMENTATION_PLAN_EC2_K8S.md)** — Step-by-step cluster setup, Terraform scripts, and Argo CD configurations.  
👉 **[Zero-Cost Deployment Reference](./ApexPOS_Deployment_Plan_Free_Tier.md)** — DNS, Let's Encrypt certificate mounting, and managed database connections.

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying of files, via any medium, is strictly prohibited.
