# ⚙️ ApexPOS Backend API Server — Node.js & Express

This is the API server for the **ApexPOS SaaS platform**, built with Express.js, MongoDB, and real-time WebSockets (Socket.IO). It handles the business logic, secure authorization, shifts management, and transactional processing.

---

## 🏛️ Directory Structure & Organization

```text
server/
├── controllers/          # Business logic handlers for all endpoints
├── middleware/           # Security, authentication, and error-handling filters
├── models/               # Mongoose schemas representing database collections
├── routes/               # API endpoint routing mappings
├── utils/                # Helper utilities (receipt generators, calculators)
├── .dockerignore         # Docker ignore rules for keeping builds slim
├── Dockerfile            # Secure production multi-stage Alpine Dockerfile
├── package.json          # Node dependencies & automation scripts
└── server.js             # Application entry point & configuration bootstrap
```

---

## 🛠️ Key Technical Components

* **REST API & Runtime**: **Node.js** with **Express.js** for routing.
* **Database (ODM)**: **Mongoose ORM** connecting to **MongoDB**, providing strict schema enforcement on transactional records.
* **Real-time Synced Events**: **Socket.IO** configured alongside the HTTP server to stream instant updates (sales, repair status changes, and notifications) across client screens.
* **Authentication**: **JWT (JSON Web Tokens)** verified via custom middleware, utilizing `bcryptjs` for secure password hashing.

---

## 🛡️ Production Security & Middleware

To meet modern security compliance, the API server integrates:
* **Helmet**: Configures HTTP headers dynamically to protect the server from well-known web vulnerabilities (XSS, clickjacking, etc.).
* **Express Rate Limiter**: Restricts incoming traffic per IP address to prevent brute-force attacks and Denial of Service (DoS).
* **CORS**: Parameterized CORS options resolving allowed origins dynamically via environment configurations.
* **Container Security**: Runs under a dedicated, low-privilege system user account (`USER apexpos`) on a minimal Alpine Linux image.

---

## 🚀 Running Locally

### 1. Prerequisites
* **Node.js (v18+)**
* A running **MongoDB** instance (local or MongoDB Atlas cluster)

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/apexpos
JWT_SECRET=your_super_secret_jwt_key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80,http://localhost:30080
```

### 3. Install Dependencies & Start Dev Server
```bash
npm install
npm run dev
```
The server will run on `http://localhost:5000` with hot-reload enabled via `nodemon`.
