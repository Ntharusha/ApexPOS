# 🚀 ApexPOS SaaS — Enterprise Point of Sale (POS) & ERP Platform

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.2-lightgrey.svg?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

**ApexPOS** is a modern, real-time, cloud-native Software-as-a-Service (SaaS) Point of Sale (POS) and Enterprise Resource Planning (ERP) platform. Designed for high performance, dual-tax compliance, and seamless multi-branch scalability.

---

## 🏛️ Application Architecture & Tech Stack

The platform is designed around a decoupled **Client-Server architecture** using the MERN stack with real-time bidirectional communication.

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef server fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef database fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff;
    classDef security fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#fff;
    classDef module fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff;

    %% Nodes
    Client["💻 React SPA Client (Vite + Zustand)"]:::client
    WebSocket["⚡ Socket.IO Client"]:::client
    
    subgraph ExpressApp ["Express.js Web Server"]
        Express["🚀 Express REST API Engine"]:::server
        Helmet["🛡️ Helmet Security Headers"]:::security
        RateLimit["⏳ Rate Limiters"]:::security
        Auth["🔑 JWT Authenticator"]:::security
        SocketIO["🔌 Socket.IO Server Manager"]:::server
    end

    Mongo[("🍃 MongoDB Database")]:::database

    %% Business Modules
    subgraph Modules ["Core Modules"]
        Retail["🛒 Retail Register"]:::module
        Rest["🍽️ Hospitality (Table / KOT)"]:::module
        Repair["🔧 Device Repair Logs"]:::module
        HP["💳 Installment / Hire Purchase"]:::module
        Delivery["🚚 Live Delivery Tracker"]:::module
        TradeIn["♻️ Trade-In Valuations"]:::module
    end

    %% Flows
    Client -->|HTTP REST Requests| Helmet
    Client -->|WebSocket Handshake| SocketIO
    
    Helmet --> RateLimit
    RateLimit --> Auth
    Auth --> Express
    
    SocketIO <-->|Bi-directional Sync| WebSocket
    Express <-->|Mongoose ORM| Mongo
    
    Client -.-> Retail
    Client -.-> Rest
    Client -.-> Repair
    Client -.-> HP
    Client -.-> Delivery
    Client -.-> TradeIn
```

---

## ⚡ Real-Time Socket.IO Synchronization Flow

All transactions, inventory status, and active cash register drawer shifts are synchronized live across cashiers and managers using WebSocket events.

```mermaid
sequenceDiagram
    autonumber
    actor CashierA as 🛒 Cashier A (Terminal 01)
    participant Server as 🔌 Express Server (Socket.IO)
    actor CashierB as 🛒 Cashier B (Terminal 02)
    actor Manager as 📊 Manager Dashboard

    CashierA->>Server: Process Sale (Emit "new-transaction")
    Server->>Server: Update Inventory in MongoDB
    Server-->>CashierA: Acknowledge Success & Print Receipt
    Server-->>CashierB: Broadcast "stock-updated" (Live Sync UI)
    Server-->>Manager: Broadcast "revenue-updated" (Real-time charts update)
```

---

## 🍃 MongoDB Entity Relationship (ER) Model

The database architecture consists of highly optimized relational models managed via Mongoose ORM.

```mermaid
erDiagram
    STAFF ||--o{ SHIFT : "manages"
    PRODUCT }|--|| CATEGORY : "belongs to"
    SALE ||--|{ SALE_ITEM : "contains"
    SALE_ITEM }|--|| PRODUCT : "references"
    SALE }|--|| CUSTOMER : "purchased by"
    ORDER ||--o{ ORDER_ITEM : "contains"
    ORDER_ITEM }|--|| PRODUCT : "references"
    ORDER }|--|| TABLE : "placed at"
    HIRE_PURCHASE ||--o{ INSTALLMENT_PLAN : "has"

    STAFF {
        ObjectId id
        string name
        string email
        string role
        string pin_hash
        string branch_id
    }
    SHIFT {
        ObjectId id
        ObjectId cashierId
        float openingFloat
        float expectedCash
        float actualCash
        string status
    }
    PRODUCT {
        ObjectId id
        string name
        float price
        int stock
        string barcode
    }
    SALE {
        ObjectId id
        float grandTotal
        float vatAmount
        float ssclAmount
        string paymentStatus
        string cashierName
    }
```

---

## ✨ Key Platform Features

*   **⚡ Real-Time Synchronized Registers**: Multi-terminal registers synchronize state changes, cash float updates, and order placements instantly.
*   **📊 Live Rich Analytics**: Interactive business intelligence dashboard built with `recharts` for calculating revenue, gross profit, and peak transactions.
*   **🌐 Dynamic Localization**: Dynamic localization switching powered by `react-i18next` for seamless multi-language compatibility.
*   **🔐 Role-Based Access Control (RBAC)**: Fine-grained user role permissions (`super_admin`, `branch_admin`, `manager`, `cashier`, `accountant`, `Technician`) backed by JSON Web Tokens.
*   **💸 Dual-Tax Support**: Sri Lankan tax compliant computation engine calculating Value Added Tax (**VAT - 18%**) and Social Security Contribution Levy (**SSCL - 2.5%**).
*   **🤝 Specialized Industry Add-ons**:
    *   **Mobile Repairs & Service Logs**: IMEI logs, estimated repair costs, status tracking, and technician signature liability pads.
    *   **Hire Purchase & Installments**: Installment plan scheduler, down payments, and due collections ledger.
    *   **Restaurant KOT & Table Management**: Live table status mapping (Available/Occupied/Reserved) and Kitchen Order Tickets (KOT) routing.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* **Node.js** v18.x or v20.x
* **MongoDB** v6.x running locally on port `27017`

### 1. Setup Repository
```bash
git clone https://github.com/Ntharusha/ApexPOS.git
cd ApexPOS
```

### 2. Configure Backend Server
```bash
cd server
npm install
```
Create a `.env` file inside `server/` using the following:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/apexpos
JWT_SECRET=your_super_secret_jwt_key_change_this
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80,http://localhost:30080
```
Start backend development:
```bash
npm run dev
```

### 3. Configure Frontend Client
```bash
cd ../client
npm install
```
Create a `.env` file inside `client/` using the following:
```env
VITE_API_URL=http://localhost:5000/api
```
Start frontend development:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 📂 Seed Scripts & Admin Credentials..

### Running Seed Scripts
From the `server/` directory:

1. **Seed default admin credentials**:
   ```bash
   node seedAdmin.js
   ```
2. **Seed sample business categories and products**:
   ```bash
   node seedProducts.js
   ```

### Default Credentials
*   **Super Admin Dashboard Access**:
    *   **Email**: `admin@apexpos.com`
    *   **Password**: `admin123`
*   **Fast Cashier Terminal Access**:
    *   **PIN**: `1234`
