# ApexPOS 🚀

ApexPOS is a cutting-edge, feature-rich Point of Sale (POS) and business management system designed with a modern **Glassmorphism Dark UI**. Built for retail shops, repair centers, and service businesses, it offers real-time synchronization and a seamless user experience.

![ApexPOS Dashboard](https://via.placeholder.com/800x450?text=ApexPOS+Dashboard+Overview)

## ✨ Key Features

### 📊 Advanced Dashboard
- Real-time sales statistics and low stock alerts.
- Interactive **Sales Trend Chart** (Last 7 days) using Recharts.
- Recent activity feed showing live transaction history.

### 🛒 Retail POS
- Fast and intuitive search-based product selection.
- Complete cart management system.
- Professional **Receipt Printing** integration.
- Real-time inventory deduction upon checkout.

### 📦 Inventory & Categories
- Dynamic product management with stock tracking.
- Automated API-driven category assignment.
- Product count tracking per category.

### 🔧 Repair Management
- Kanban-style board for tracking device repairs.
- Manage customer details, device issues, and technician notes.
- Status workflow (Pending → In Progress → Ready → Completed).

### 🚚 Delivery Tracking
- Dedicated delivery hub for managing shipments.
- Real-time status updates (Pending → In Transit → Delivered).
- Customer contact and location details.

### 👥 Registration Hub
- **Staff**: Manage employees, roles (Admin/Technician/Cashier), and salaries.
- **Customers**: Track purchase history, loyalty points, and contact info.
- **Suppliers**: Manage company details and payment terms.

---

## 🛠️ Tech Stack

**Frontend:**
- **React 18** + **Vite** (Ultra-fast builds)
- **Tailwind CSS** (Custom Glassmorphism theme)
- **Framer Motion** (Smooth animations)
- **Zustand** (Lightweight state management)
- **Recharts** (Interactive data visualization)
- **Socket.io-client** (Real-time updates)

**Backend:**
- **Node.js** + **Express**
- **MongoDB** + **Mongoose** (Database)
- **Socket.io** (Websocket communication)
- **Dotenv** (Environment management)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/Ntharusha/ApexPOS.git
cd ApexPOS
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```
Start the backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📸 Screenshots
*(Add your screenshots here)*

## 📄 License
This project is licensed under the MIT License.

## 🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.
