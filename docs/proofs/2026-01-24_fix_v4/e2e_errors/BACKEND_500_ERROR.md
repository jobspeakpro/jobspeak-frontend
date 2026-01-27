# Backend 500 Error - Affiliate Apply

## Summary
Frontend payload fix deployed successfully (commit `a2d34f5`). Backend now receives correct field names but returns **500 Internal Server Error**.

## Request Details
**Endpoint**: `POST /api/affiliate/apply`  
**URL**: `https://jobspeakpro.com/api/affiliate/apply` (proxied to Railway)  
**Method**: POST  
**Content-Type**: application/json

## Exact Payload Sent
See: `affiliate_apply_payload.json`

```json
{
  "name": "E2E Success Test User",
  "email": "e2e_success_1738031880342@example.com",
  "country": "US",
  "primaryPlatform": "twitter",
  "audienceSize": "10k",
  "channelLink": "https://twitter.com/e2esuccessuser",
  "promoPlan": "E2E automated SUCCESS test strategy content for production verification",
  "payoutPreference": "paypal",
  "payoutDetails": {
    "email": "paypal_success_1738031880342@example.com"
  }
}
```

## Response
**Status**: 500 Internal Server Error  
**Body**:
```json
{
  "error": "Internal server error"
}
```

## Timeline
1. **2026-01-26 21:06 EST**: Backend health confirmed (200 OK)
2. **2026-01-26 21:09 EST**: First E2E test - 400 validation error (field name mismatch)
3. **2026-01-26 21:10 EST**: Fixed frontend payload (`platform` → `primaryPlatform`, `payoutMethod` → `payoutPreference`)
4. **2026-01-26 21:15 EST**: Deployed fix (commit `a2d34f5`)
5. **2026-01-26 21:18 EST**: Second E2E test - **500 Internal Server Error**

## Frontend Status
✅ Payload field names corrected  
✅ Deployed to production  
✅ Bundle hash changed (verified deployment)

## Backend Status
❌ Receiving correct payload but crashing with 500  
❌ No detailed error message returned  
❌ Blocking E2E success verification

## Next Steps
Backend team needs to:
1. Check Railway logs for stack trace
2. Reproduce error using exact payload in `affiliate_apply_payload.json`
3. Fix internal server error
4. Confirm `/api/affiliate/apply` returns 200/201 with success response

## Proof Artifacts
- `affiliate_apply_payload.json` - Exact payload sent
- `../e2e_success/console_clean.txt` - Console logs showing 500 error
- `../e2e_success/03_affiliate_submit_error.png` - Screenshot of error state
- `../e2e_success/e2e_success_recording.webm` - Video of test execution
