# Backend Stripe Checkout Session Update Instructions

## Overview
Update the Stripe checkout session creation to redirect to the landing page (`/`) with query parameters for success and canceled states.

## Backend Endpoint
The frontend calls: `/api/billing/create-checkout-session`

## Required Changes

### Update `success_url` and `cancel_url`

In your backend code where you create the Stripe checkout session, update the URLs to:

**Current (example):**
```javascript
// Example - replace with your actual code structure
const session = await stripe.checkout.sessions.create({
  // ... other session config
  success_url: `${APP_URL}/checkout/success`,  // or similar
  cancel_url: `${APP_URL}/checkout/cancel`,    // or similar
});
```

**Updated:**
```javascript
// Replace APP_URL with your frontend URL (e.g., https://yourdomain.com)
const session = await stripe.checkout.sessions.create({
  // ... other session config
  success_url: `${APP_URL}/?success=true`,
  cancel_url: `${APP_URL}/?canceled=true`,  // or `${APP_URL}/pricing?canceled=true` if preferred
});
```

### Example Implementation

```javascript
// Example Node.js/Express implementation
app.post('/api/billing/create-checkout-session', async (req, res) => {
  try {
    const { userKey, priceType } = req.body;
    
    // Get your frontend URL from environment variable
    const APP_URL = process.env.APP_URL || process.env.FRONTEND_URL || 'https://yourdomain.com';
    
    const session = await stripe.checkout.sessions.create({
      // ... your existing session configuration
      mode: 'subscription',
      line_items: [
        // ... your line items
      ],
      success_url: `${APP_URL}/?success=true`,
      cancel_url: `${APP_URL}/?canceled=true`,  // or `${APP_URL}/pricing?canceled=true`
      // ... other session options
    });
    
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Environment Variable

Make sure your backend has access to the frontend URL:

```bash
# Example .env or environment configuration
APP_URL=https://yourdomain.com
# or
FRONTEND_URL=https://yourdomain.com
```

## Frontend Changes (Already Completed)

✅ LandingPage now handles `?success=true` and `?canceled=true` query params
✅ Shows toast notifications for both states
✅ No navigation logic redirects away on canceled state
✅ Analytics tracking maintained

## Testing

After updating the backend:

1. **Test Success Flow:**
   - Initiate checkout from frontend
   - Complete payment in Stripe
   - Should redirect to `/?success=true`
   - Should see success toast on landing page

2. **Test Cancel Flow:**
   - Initiate checkout from frontend
   - Cancel in Stripe checkout
   - Should redirect to `/?canceled=true` (or `/pricing?canceled=true`)
   - Should see canceled toast on landing page

## Notes

- The frontend LandingPage (`/`) now handles both success and canceled states
- Toast notifications auto-dismiss after 6 seconds
- URL params are cleaned up after processing (no visible query params in browser)
- Analytics events are still tracked for both success and cancel

