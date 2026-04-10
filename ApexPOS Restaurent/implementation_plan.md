# ApexPOS System Implementation Plan

This document outlines the step-by-step phased approach for building, iterating, and deploying the ApexPOS restaurant and retail platform. This serves as a blueprint for understanding how the core systems interact and how to systematically construct them.

## Phase 1: Core Backend Foundation & Database Design

**Goal:** Establish the persistent data layer and secure API routing for essential functions.

1. **Initialize Server Skeleton**
   - Setup Node.js + Express backend.
   - Configure basic middlewares (`cors`, `helmet`, `express.json()`).
   - Connect to MongoDB via Mongoose.

2. **Core Database Models (`AllModels.js`)**
   - Implement `Staff` (Authentication, Roles, PIN hashes).
   - Implement `Branch` and `Settings` (Tax logic, multi-store support).
   - Implement `Product` (Pricing, Stock, Tax Categories, Allergens).
   - Implement `Customer` (CRM, Loyalty points).

3. **Core API Routes & Controllers**
   - Auth Routes: JWT login, fast PIN cashier login.
   - Setup/Admin Routes: CRUD endpoints for Categories & Products.
   - Financial Routes: API for daily Shifts (`Opening Float`, `Closing Variance`).

## Phase 2: Frontend Foundation & State Management

**Goal:** Formulate the React interface and global data handlers.

1. **Initialize Client Application**
   - scaffolding via Vite + React + TypeScript.
   - Integrate TailwindCSS and configure dark/light theme tokens.
   - Install essential libraries (`lucide-react`, `framer-motion`, `axios`, `react-router-dom`).

2. **Zustand State Architecture (`useStore.ts`)**
   - **Auth Slice:** Store JWT, User profile, Branch ID.
   - **POS Slice:** Active cart array, Discount variables, Shift status validation.
   - **Offline Engine:** Detect `navigator.onLine`, manage `pendingSales` queues, and locally cache products into memory.

3. **Core Layout Elements**
   - Sidebar routing system based on Role-Based Access Control (RBAC).
   - Global Header (Notifications, Theme Toggle, Shift Start trigger).

## Phase 3: The Point of Sale (POS) Engine

**Goal:** Deliver the primary interface where cash transactions happen quickly and reliably.

1. **Retail POS Screen (`RetailPOS.tsx`)**
   - Render dynamic product grids with Stock and Dietary tag badges.
   - Implement global `keydown` event listener for instantaneous barcode scanning.
   - Build real-time cart module with SSCL / VAT calculated dynamically from global `Settings`.

2. **Checkout & Payment System (`CheckoutModal.tsx`)**
   - Split Payments functionality.
   - Cash logic (calculating exactly how much change is owed).
   - LANKA-QR or Third-Party integration placeholders for digital payments.
   - **Offline Fail-safes:** If disconnected, queue the sale payload to `useStore` pending list instead of throwing an error.

3. **Receipt Generation (`Receipt.tsx`)**
   - Hidden print element formatted for 80mm thermal paper.
   - Hooks into browser `window.print()`.

## Phase 4: Advanced Hospitality Extensions

**Goal:** Transform the standard Retail POS into a fully functional Restaurant/Dine-In platform.

1. **Table Layout & Merging (`TableManagement.tsx`)**
   - Map custom tables visually with capacity limits.
   - Enable actions: Open Order, Transfer Table, Merge Table, Checkout Table.

2. **Complex Ordering Logic**
   - Implement "Course Firing" rules (Start prep on Starters before Mains).
   - Allow partial checkout and complex Dutch-pay bill splitting.

3. **Kitchen Display System (KDS)**
   - Build a real-time monitor interface (`KDS.tsx`) polling or listening to WebSocket connections for incoming 'Pending' KOTs (Kitchen Order Tickets).
   - Mark orders as 'Preparing', 'Ready', or 'Served'.

4. **Patron QR Ordering**
   - Create isolated `QROrder.tsx` route generating unique session IDs linked to specific `Table` models.
   - Build restrictive APIs to allow patrons to add items directly to the KDS without cashier intervention.

## Phase 5: CRM, Inventory & Admin Integrations

**Goal:** Equip administrators with oversight, supply-chain control, and customer analytics.

1. **CRM Operations**
   - Build sliding `CustomerCRMPanel.tsx` to search clients by phone number mid-transaction.
   - Track total spent and calculate Loyalty points automatically post-purchase.

2. **Inventory Logistics**
   - Hook stock movements into sale closures (auto-deduct ingredients or sub-products based on POS events).
   - Create `Delivery.tsx` and `RepairManagement.tsx` for tracking extended service contracts or online orders.

3. **Analytics Dashboard (`Dashboard.tsx`)**
   - Aggregate sales across days/months for charts using `recharts`.
   - Create `Reports.tsx` for exporting CSV/Excel data manually.

## Phase 6: Cloud Deployment & Hardening

**Goal:** Transition from local development to a stable production environment.

1. **Security & Validation**
   - Implement express-rate-limit to block brute force logins.
   - Validate input schemas (e.g. using `zod` or `joi`) on the backend.

2. **Containerization**
   - Write standard `Dockerfile` for backend.
   - Write multi-stage `Dockerfile` (Node builder -> Nginx host) for the frontend static files.

3. **Deployment Topology (e.g. AWS / Oracle Cloud)**
   - Deploy MongoDB onto a stable stateful tier (Atlas or managed instance).
   - Launch application containers.
   - Utilize a Reverse Proxy (Nginx / Caddy / Traefik) to manage SSL certificates and domain pointing.

## Phase 7: Post-Launch & Maintenance

- Monitor frontend performance bottlenecks when processing large offline dataset syncs.
- Listen for cashier feedback on POS response times.
- Implement automated DB backups mapping to AWS S3 or equivalent.
