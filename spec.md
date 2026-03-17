# OficiosApp

## Current State
Marketplace for tradespeople (plumbers, electricians, etc.) with:
- Public listing browsing with filters (category, city, country)
- User registration with email/password (authorization component)
- Listing CRUD with image uploads (blob-storage component)
- Private messaging between users
- Ratings system
- No payment functionality

## Requested Changes (Diff)

### Add
- Stripe payment integration using Option B (central account)
- Backend endpoint to create a Stripe Checkout Session for a given listing
- Backend endpoint to record payment orders (pending/completed status)
- "Contratar" (Hire) button on listing detail page that initiates Stripe checkout
- Payment success and cancel redirect pages
- Payment history page in user profile (shows payments made by the user)

### Modify
- Listing detail view: add "Contratar" button if user is logged in and is not the owner
- User profile: add a "Mis Pagos" tab showing payment history

### Remove
- Nothing removed

## Implementation Plan
1. Select Stripe component
2. Regenerate backend with Stripe Checkout Session creation, payment record storage, and payment query APIs
3. Frontend: add "Contratar" button on listing detail page that calls createCheckoutSession
4. Frontend: add payment success/cancel pages
5. Frontend: add "Mis Pagos" tab in user profile
6. Currency: COP (Colombian Peso), price from listing.price field
