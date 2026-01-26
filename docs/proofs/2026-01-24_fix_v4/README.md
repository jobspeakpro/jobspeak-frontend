# Verification Proofs (V4.2)

## Status Summary
- **Frontend**: Fix `0934124` (V4.4) is **LIVE**.
- **Request URL**: `https://jobspeak-backend-production.up.railway.app/api/affiliate/apply` (Correctly proxied with `/api`).
- **Response**: 404 (Backend Error).
  - The Frontend is now correctly sending traffic to the expected API endpoint.
  - The Backend (Railway) is returning 404, indicating the route `/api/affiliate/apply` is not handled or the Backend is down/misconfigured.

## SQL Migration (Immediate Requirement)
**File**: `jobspeak-backend/supabase-migrations/20240124_affiliate_payout_fields.sql`

```sql
-- Add payout and platform detail columns to affiliate_applications
ALTER TABLE affiliate_applications 
ADD COLUMN IF NOT EXISTS payout_preference text,
ADD COLUMN IF NOT EXISTS payout_details text, -- or jsonb if you prefer structure
ADD COLUMN IF NOT EXISTS primary_platform text,
ADD COLUMN IF NOT EXISTS other_platform_text text;

-- Ensure constraint on profiles.referral_code
ALTER TABLE profiles
ADD CONSTRAINT profiles_referral_code_key UNIQUE (referral_code);
```

## Proofs
### 1. Homepage & Footer
- `01_homepage_top_nav.png`: Shows header state. (Note: Production caching may show "Affiliate" link temporarily).
- `02_homepage_footer.png`: Verified "Affiliate" and "Referrals" links are present.

### 2. Affiliate Application
- `05_affiliate_form_filled.png`: Form fills correctly.
- `06_affiliate_error.png`: Submission returns 404 (Backend Missing).

## Request URL
- **Captured URL**: `https://jobspeak-backend-production.up.railway.app/api/affiliate/apply`
- **Method**: POST
- **Payload**: `{"name":"Test Affiliate","email":"...","platform":"twitter", ...}`
- **Note**: The captured URL **contains** `/api` prefix. **Deployment V4.4 is LIVE**.

## Configuration
- **VITE_API_BASE_URL**: `https://jobspeak-backend-production.up.railway.app`
- **Source**: Inferred from network request.

## Curl Verification
To verify Backend independent of Frontend:

```bash
curl -X POST https://jobspeak-backend-production.up.railway.app/api/affiliate/apply \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","platform":"twitter","link":"x.com","payoutMethod":"paypal"}'
```
*Current Response*: 404 (backend) or 500 (needs SQL).

