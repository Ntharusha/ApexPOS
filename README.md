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

**Backend (Server)**
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

## ☁️ Production Deployment & Future Planning

Planning to deploy ApexPOS to production? We have structured a highly optimized architecture to leverage 100% free-tier services. Here is the breakdown of the free services we plan to utilize for our future cloud infrastructure:

| Service | Free Tier Details | Duration |
|---------|------------------|----------|
| **AWS EC2** | 750 hrs/mo of t2.micro (1 vCPU, 1GB RAM) | 12 months |
| **AWS EBS** | 30 GB of gp2/gp3 storage | 12 months |
| **AWS CloudWatch** | 10 custom metrics, 10 alarms, 5GB log ingestion, 3 dashboards | Always free |
| **AWS Data Transfer** | 100 GB/mo outbound | 12 months |
| **MongoDB Atlas M0** | 512 MB storage, shared cluster, 100 max connections | Always free |
| **Vercel Hobby** | 100 GB bandwidth, 100 deployments/day, serverless functions | Always free |
| **Docker Hub** | 1 private repo, unlimited public repos | Always free |
| **k3s** | Lightweight Kubernetes (CNCF certified) | Always free (OSS) |
| **Jenkins** | Open-source CI/CD | Always free (OSS) |
| **Terraform** | Open-source IaC | Always free (OSS) |
| **Argo CD** | Open-source GitOps CD | Always free (OSS) |
| **Let's Encrypt** | Free SSL certificates | Always free |
| **Cloudflare** | Free DNS + CDN + SSL | Always free |

👉 **[Implementation plan (EC2 + k3s + Jenkins CI + Argo CD)](./IMPLEMENTATION_PLAN_EC2_K8S.md)** — phased execution checklist  
👉 **[Full deployment reference](./ApexPOS_Deployment_Plan_Free_Tier.md)** — commands, manifests, troubleshooting

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying of files, via any medium, is strictly prohibited.
