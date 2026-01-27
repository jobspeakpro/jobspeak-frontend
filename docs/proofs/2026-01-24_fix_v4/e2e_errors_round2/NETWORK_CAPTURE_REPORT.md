# Backend 500 Error - Round 2 Network Capture

## Request Details

**URL**: `https://jobspeak-backend-production.up.railway.app/api/affiliate/apply`  
**Method**: POST  
**Content-Type**: application/json

### Request Headers
```json
{
  "x-guest-key": "99178652-4a23-45e5-bb91-ddf9d912d370",
  "sec-ch-ua-platform": "\"Windows\"",
  "Referer": "https://jobspeakpro.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
  "sec-ch-ua": "\"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
  "Content-Type": "application/json",
  "sec-ch-ua-mobile": "?0"
}
```

### Request Payload
See: `request_payload.json`

```json
{
  "name": "DevTools Capture Test",
  "email": "devtools_1769481446707@example.com",
  "country": "US",
  "primaryPlatform": "twitter",
  "audienceSize": "10k",
  "channelLink": "https://twitter.com/devtoolstest",
  "promoPlan": "DevTools network capture test",
  "payoutPreference": "paypal",
  "payoutDetails": {
    "email": "paypal_devtools_1769481446707@example.com"
  }
}
```

## Response Details

**Status**: 500 Internal Server Error  
**Status Text**: (empty)

### Response Headers
See: `response_details.json`

### Response Body
```json
{
  "error": "Internal server error"
}
```

## Timeline
- **2026-01-26 21:37 EST**: Network capture executed
- **Request sent**: Direct to Railway backend (not proxied through Vercel)
- **Response received**: 500 Internal Server Error

## Key Observations

1. **Payload is correct**: All field names match backend schema (`primaryPlatform`, `payoutPreference`)
2. **Request goes directly to Railway**: `https://jobspeak-backend-production.up.railway.app/api/affiliate/apply`
3. **No authentication headers**: Only `x-guest-key` present, no Authorization/Cookie
4. **Generic error response**: Backend returns no stack trace or detailed error message

## Source of Truth Files
- `request_payload.json` - Exact JSON payload sent
- `request_details.json` - Full request including headers
- `response_details.json` - Full response including headers
- `error_page_state.png` - Screenshot of error state

## Backend Action Required
Backend team must:
1. Check Railway logs for this exact timestamp (2026-01-26 21:37 EST)
2. Reproduce error using exact payload in `request_payload.json`
3. Return detailed error message (not generic "Internal server error")
4. Fix root cause and confirm 200/201 response
