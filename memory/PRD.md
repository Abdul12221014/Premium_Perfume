# ARAR Parfums - Product Requirements Document

## Project Overview
ARAR Parfums is an ultra-luxury e-commerce website for a high-end fragrance house. The design philosophy prioritizes scarcity, heritage, and authority over mass-market e-commerce patterns.

## Original Problem Statement
Build a complete, world-class, ultra-luxury e-commerce website with:
- Visually expensive and minimalist design with dark, elegant theme
- Pages: Homepage, Product Detail, The House (About), Atelier, Journal, Contact
- Stripe payment integration
- Dynamic content management via admin system
- Database-driven product catalog

## Brand Identity
- **Tagline**: "Identity, Distilled."
- **Philosophy**: "A presence you do not announce. A memory that remains."
- **Color Palette**: 
  - Charcoal: #0F0E0D
  - Linen: #F4F1EA  
  - Bronze Accent: #BFA46D
- **Typography**: Playfair (headings), Montserrat (body)

## Architecture

### Tech Stack
- **Frontend**: React, React Router, Tailwind CSS, Axios
- **Backend**: FastAPI (Python), MongoDB (motor async driver)
- **Authentication**: JWT with bcrypt password hashing
- **Payments**: Stripe via emergentintegrations library
- **Image Storage**: Cloudinary (abstraction layer ready)

### Project Structure
```
/app/
├── backend/
│   ├── config/database.py
│   ├── middleware/auth_middleware.py
│   ├── models/ (product, order, collection, admin)
│   ├── routes/ (admin, products, collections, orders, checkout, public)
│   ├── services/ (auth, image_storage)
│   └── server.py
├── frontend/
│   ├── src/
│   │   ├── components/ (Navigation, Footer)
│   │   └── pages/ (HomePage, ProductDetailPage, etc.)
│   └── .env
└── test_reports/
```

### Database Schema
- **products**: id, name, slug, price, price_amount, stock_quantity, status, notes (top/heart/base), etc.
- **orders**: id, stripe_session_id, product_id, customer_email, amount, currency, status
- **collections**: id, name, description, featured
- **admin_users**: id, email, full_name, role, hashed_password
- **newsletter**: id, email, subscribed_at
- **contact_inquiries**: id, name, email, message, created_at

## What's Been Implemented

### Phase 1: Static Website ✅
- Multi-page luxury website with institutional aesthetic
- Homepage with hero, product grid, brand philosophy
- Product detail pages with full olfactory information
- The House, Atelier, Journal, Contact pages
- Mobile-responsive navigation

### Phase 2: Functionality & Stripe ✅
- Functional navigation and CTAs
- Newsletter subscription (MongoDB storage)
- Contact form submission
- Stripe checkout flow (test mode)
- Success page with order confirmation

### Phase 3: Backend Refactoring ✅
- Migrated from single server.py to modular architecture
- Separate routes, models, services, middleware
- JWT authentication for admin routes
- Data migration from old schema to new

### Phase 4: P0 Backend Stabilization ✅ (Current Session)
- **Fixed 307 Redirect Issue**: Set `redirect_slashes=False` in FastAPI
- **Implemented Stripe Webhook**: Full checkout.session.completed handling
- **Production-grade Checkout**: Uses emergentintegrations library
- **Database Consistency**: Added unique indexes on slug, stripe_session_id
- **Image Storage Abstraction**: Cloudinary-ready with swap capability
- **Security Hardened**: Price from DB only, stock validation

## API Endpoints

### Public
- `GET /api/fragrances` - All published products
- `GET /api/fragrances/{slug}` - Single product
- `POST /api/newsletter` - Subscribe
- `POST /api/contact` - Submit inquiry
- `POST /api/create-checkout-session` - Start payment
- `GET /api/checkout/status/{session_id}` - Check payment
- `POST /api/webhook/stripe` - Stripe webhook

### Admin (JWT Protected)
- `POST /api/admin/login` - Get token
- `GET /api/admin/me` - Current user
- `GET/POST /api/admin/products` - List/Create products
- `GET/PUT/DELETE /api/admin/products/{id}` - Single product ops
- `GET /api/admin/collections` - List collections
- `GET /api/admin/orders` - List orders

## Credentials
- **Admin**: admin@arar-parfums.com / ArarAdmin2024!
- **Stripe**: sk_test_emergent (via emergentintegrations)

## Prioritized Backlog

### P0 - Complete ✅
- [x] Fix 307 redirect on admin routes
- [x] Implement Stripe webhook
- [x] Validate data consistency
- [x] Clean server structure

### P1 - Next Priority
- [ ] Build Admin Dashboard UI (/admin route)
- [ ] Implement product image uploads (Cloudinary)
- [ ] Add product management interface

### P2 - Future
- [ ] Multi-currency support
- [ ] Customer accounts & order history
- [ ] Email notifications (order confirmation, shipping)
- [ ] Analytics dashboard
- [ ] Collections management UI
- [ ] Inventory alerts

## Known Limitations
- "Made with Emergent" badge is platform-injected (cannot remove)
- Stripe in test mode (production keys needed for live)
- Product images are SVG placeholders (no real uploads yet)

## Testing
- Backend: 100% pass rate (29 tests)
- Test file: /app/backend/tests/test_arar_backend.py
- Report: /app/test_reports/iteration_1.json

---
*Last Updated: February 19, 2026*
