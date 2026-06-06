# 💻 ApexPOS Frontend Client — React & TypeScript SPA

This is the production-ready frontend single-page application (SPA) for the **ApexPOS SaaS platform**, built with modern design principles, state-of-the-box localizations, and real-time updates.

---

## 🏛️ Directory Structure & Organization

```text
client/
├── public/                 # Static assets & public resources
├── src/
│   ├── api/                # Axios instance configuration & endpoint handlers
│   ├── assets/             # Images, icons, and theme files
│   ├── components/         # Reusable presentation & layout UI components
│   ├── locales/            # Translation dictionary files (EN, ES, etc.) for i18n
│   ├── pages/              # Main route views (Dashboard, POS Register, Repairs, etc.)
│   ├── store/              # Zustand global state stores (Auth, Cart, Register shifts)
│   ├── App.tsx             # Main routing & application wrapper
│   ├── i18n.js             # Internationalization setup using react-i18next
│   ├── index.css           # Global Tailwind CSS configurations & styling tokens
│   └── main.tsx            # React entry point
├── Dockerfile              # Multi-stage Docker config (using non-root Nginx)
├── nginx.conf              # Production Nginx reverse-proxy & routing rules
├── vite.config.js          # Vite build bundler configuration
└── package.json            # Client dependencies & scripts
```

---

## 🛠️ Technical Stack & Framework Choices

* **Framework**: **React 19** with **TypeScript** for absolute type safety across modules.
* **Build Engine**: **Vite** for rapid hot-module replacement (HMR) during development.
* **State Management**: **Zustand** — chosen for its lightweight footprint and clean hooks pattern, managing cart items, authentication status, and cashier shift state.
* **Styling**: **Tailwind CSS** paired with **Framer Motion** for premium micro-animations and dynamic layout rendering.
* **Internationalization**: **i18next** (using `react-i18next`) supporting seamless multi-language translation.
* **Charts & Visualization**: **Recharts** for real-time sales reporting and margin tracking graphs.

---

## 🐳 Production Containerization & Routing

In production, the React client is built into static assets and hosted inside a lightweight, secure container:
* **Docker Container**: Uses `nginxinc/nginx-unprivileged:alpine` as the base image to run Nginx on a non-root port (`8080`) for hardened cluster security.
* **Nginx Configuration (`nginxconf`)**: Maps all routing fallbacks back to `index.html` to support client-side React Router navigation cleanly without `404` errors on refresh.

---

## 🚀 Running Locally

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed.

### 2. Setup Environment Variables
Create a `.env` file inside the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies & Start Dev Server
```bash
npm install
npm run dev
```
The application will boot at `http://localhost:5173`.
