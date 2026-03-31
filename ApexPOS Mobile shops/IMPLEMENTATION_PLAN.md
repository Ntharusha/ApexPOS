# 🚀 CeylonPOS Feature Integration — Implementation Plan
**Project:** ApexPOS → CeylonPOS Upgrade  
**PRD Version:** 2.0  
**Updated:** 2026-02-20  
**Platform:** Web (React + Vite PWA) + Android (React Native) + Node.js Backend  
**Segments:** Retail · Hospitality · Pharmacy  

---

## 🗺️ Architecture Overview

```
┌──────────────────────────────────────────────────┐
│              ApexPOS Backend API                 │
│         (Node.js + Express + MongoDB)            │
│         + JWT Auth + Socket.io + Tax Engine      │
└──────────┬───────────────────────────┬───────────┘
           │                           │
  ┌────────▼────────┐         ┌────────▼────────┐
  │  PWA Web App    │         │ Android (Future) │
  │  (React + Vite) │         │ (React Native)   │
  └────────┬────────┘         └─────────────────┘
           │
  ┌────────▼──────────────────────────────────────┐
  │  Zustand (Client State) + Local Cart Queue    │
  └───────────────────────────────────────────────┘
```

---

## ✅ Already Implemented (Sprints 1 & 2 Progress)

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-Payment Checkout Modal | ✅ Done | Cash, Card, LankaQR, Split Payments |
| CeylonPOS Tax Engine | ✅ Done | VAT 18% + SSCL 2.5% shared logic |
| JWT & PIN Auth System | ✅ Done | Password (Web) + 4-digit PIN (Terminal) |
| Hire Purchase New Account | ✅ Done | Auto-generator + Installment preview |
| Staff Management UI | ✅ Done | Role-based registration + Auth config |
| Shift Management | ✅ Done | Opening float, Closing variance, Cashier tracking |
| Barcode Scanner Integration | ✅ Done | HID listener in RetailPOS |
| Reports V2 | ✅ Done | Tax Summary, Product Performance, HP Collections |

---

## 🚧 Sprint 2 — Analytics & Inventory (CURRENT)
**Tasks mapped from:** RPT-001, RPT-002, INV-002, INV-003, AUTH-002

### Task 5: Core Reporting (RPT-001, RPT-002, TAX-001) ✅ DONE
- [x] Daily Cash Report (Sales - Expenses = Net Profit)
- [x] VAT & SSCL Quarterly Summary
- [x] Product Performance (top sellers, slow movers)
- [x] HP Collection & Partial Sales tracking
- [x] **PDF Export integration** (React-to-Print/jspdf)
- [x] **Excel Export** (xlsx/csv)

### Task 6: Real-time Stock Tracking (INV-002) ✅ DONE
- [x] Backend: Update product stock on sale completion
- [x] Frontend: Dashboard low-stock widget with one-click PO generation
- [x] Inventory history log (Stock In/Out)

### Task 7: Shift Management & Cash Control (AUTH-002) ✅ DONE
- [x] Shift open modal: cashier name + opening float
- [x] Shift close: count cash, system shows expected, highlight variance
- [x] Backend logic for cash sales vs non-cash sales summary
- [x] Route guards: can't sell without open shift

---

## 🗓️ Sprint 3 — Advanced & Vertical Modules
**Tasks mapped from:** HOSP-001/002, PHARM-001/002, SYNC-001, I18N-001, EINV-001

### Task 8: Hospitality Module (HOSP-001, HOSP-002)
- [ ] `TableManagement.tsx` — visual floor plan
- [ ] Table states: Available / Occupied / Reserved / Bill Requested
- [ ] KOT (Kitchen Order Token) — print/display to kitchen
- [ ] Add hospitality route to `App.tsx`

### Task 9: Pharmacy Module (PHARM-001, PHARM-002)
- [ ] Batch number + expiry date on products
- [ ] FEFO enforcement on POS checkout
- [ ] Expiry alerts on dashboard
- [ ] `stock_batches` sub-model

### Task 10: Offline Sync Engine (SYNC-001)
- [ ] Event queue in localStorage / IndexedDB
 - [ ] Sync status indicator: � Synced · 🟡 Queued · 🔴 Offline
- [ ] Auto-flush on reconnect

### Task 11: Sinhala / Tamil Localization (I18N-001)
- [ ] i18n JSON files (already has `i18n.js` + `locales/`)
- [ ] Verify all screens have translation keys
- [ ] Sinhala Unicode font (Noto Sans Sinhala)
- [ ] Language switcher in header

### Task 12: IRD E-Invoicing (EINV-001)
- [ ] IRD XML schema generation
- [ ] Quarterly VAT/SSCL report in IRD format
- [ ] Nightly reconciliation job (TAX-005)

---

##  CeylonPOS PRD Task Backlog (Mapped to Epics)

| Task ID | Priority | Effort | Description | Sprint |
|---------|----------|--------|-------------|--------|
| INFRA-001 |  | L | Monorepo structure | Later |
| INFRA-002 | 🔴 | M | SQLite local DB + PostgreSQL | Later |
| AUTH-001 | 🔴 | M | JWT + PIN multi-role auth | ✅ Done |
| AUTH-002 | 🟠 | M | Shift open/close management | ✅ Done |
| AUTH-003 | 🟡 | S | Session auto-lock | Sprint 3 |
| INV-001 | 🔴 | L | Product CRUD (multi-lang) | ✅ Done |
| INV-002 | 🔴 | M | Real-time stock tracking | ✅ Done |
| INV-003 | 🟠 | M | Barcode / QR scanner | ✅ Done |
| INV-004 | 🟡 | M | Supplier + PO management | Sprint 3 |
| TAX-001 | 🔴 | M | Tax category config | ✅ Done |
| TAX-002 | 🔴 | M | VAT engine (inclusive/exclusive) | ✅ Done |
| TAX-003 | 🔴 | M | SSCL engine | ✅ Done |
| TAX-004 | 🔴 | L | Quarterly IRD report | ✅ Done |

| TAX-005 | 🟠 | M | Nightly reconciliation job | Sprint 3 |
| BILL-001 | 🔴 | L | Checkout screen enhancement | Sprint 1 |
| BILL-002 | 🔴 | M | Split payment processing | Sprint 1 |
| BILL-003 | 🔴 | M | Thermal receipt (ESC/POS) | Sprint 1 |
| BILL-004 | 🟠 | M | WhatsApp digital receipt | Sprint 3 |
| BILL-005 | 🟡 | S | Bill hold and recall | Sprint 2 |
| BILL-006 | 🟠 | M | Returns and refunds | Sprint 3 |
| PAY-001 | 🔴 | L | LANKAQR dynamic QR gen | Sprint 1 |
| PAY-002 | 🔴 | L | Payment webhook confirmation | Sprint 2 |
| PAY-003 | 🟠 | M | UPI / PhonePe (Indian tourists) | Sprint 3 |
| PAY-004 | 🟡 | M | Soundbox integration | Sprint 3 |
| SYNC-001 | 🔴 | XL | Offline event queue | Sprint 3 |
| SYNC-002 | 🔴 | L | Conflict resolution | Sprint 3 |
| RPT-001 | 🔴 | L | Sales dashboard | ✅ Done |
| RPT-002 | 🟠 | M | Product performance report | ✅ Done |
| RPT-003 | 🟠 | M | Peak hour heatmap | Sprint 3 |
| HOSP-001 | 🔴 | L | Floor plan + table mgmt | Sprint 3 |
| HOSP-002 | 🔴 | L | KOT system | Sprint 3 |
| HOSP-003 | 🟠 | M | Waiter mode | Sprint 3 |
| HOSP-004 | 🟠 | M | Split billing | Sprint 3 |
| HOSP-005 | 🟠 | M | Menu management | Sprint 3 |
| HOSP-006 | 🟡 | L | Delivery platform integration | Later |
| PHARM-001 | 🔴 | L | Batch + expiry tracking | Sprint 3 |
| PHARM-002 | 🔴 | M | FEFO enforcement | Sprint 3 |
| PHARM-003 | 🟠 | M | Drug interaction alert | Sprint 3 |
| PHARM-004 | 🟠 | M | Controlled substance log | Sprint 3 |
| EINV-001 | 🟠 | L | IRD XML generation | Sprint 3 |
| EINV-002 | 🟠 | L | IRD transmission API | Later |
| PDPA-001 | 🟠 | M | Data subject rights portal | Sprint 3 |
| I18N-001 | 🔴 | M | Sinhala/Tamil/English UI | Sprint 3 |

---

## 🛠️ Tech Stack (ApexPOS Current)

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Zustand (persisted) |
| Animations | Framer Motion |
| Charts | Recharts |
| Real-time | Socket.io client |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (to be implemented) + bcrypt |
| Print | react-to-print + ESC/POS CSS |
| i18n | i18next (already configured) |

---

## 📁 New Files To Create (Sprint 1)

| File | Purpose |
|------|---------|
| `server/middleware/auth.js` | JWT verify middleware |
| `server/controllers/authController.js` | Login / register / PIN |
| `server/routes/authRoutes.js` | Auth routes |
| `server/utils/taxEngine.js` | Shared VAT/SSCL utility |
| `client/src/api/axios.ts` | Centralized API client (with auth header) |
| `client/src/components/pos/CheckoutModal.tsx` | Multi-payment checkout modal |
| `client/src/components/pos/LankaQRDisplay.tsx` | Mock QR code payment display |

---

*Implementation Plan — CeylonPOS / ApexPOS*  
*Last updated: 2026-02-20 by Antigravity AI*
