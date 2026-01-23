# Manual Test Script for Loom Recording

## Setup Instructions

1. **Open Chrome in Incognito Mode** (for guest tests)
2. **Open DevTools** (F12)
3. **Configure DevTools:**
   - Network tab: Check "Preserve log"
   - Application tab: Open → Local Storage → `https://jobspeakpro.com`
   - Keep both tabs visible in split view
4. **Start Loom Recording:**
   - Record entire screen or browser window
   - Ensure system clock is visible OR DevTools timestamp is visible
5. **Follow each test below**

---

## Test 1: Guest Incognito Flow

### Steps:
1. **Open fresh incognito window** → Navigate to `https://jobspeakpro.com/practice`
2. **Skip/complete onboarding** (if shown)
3. **Type answer** in practice textbox
4. **Click "✨ Fix my answer"** button
5. **Wait for results** to appear
6. **Verify:** Referral modal appears
7. **Select option** (e.g., "TikTok")
8. **Show DevTools:**
   - Application tab → Local Storage
   - Verify keys:
     - `jsp_heard_about_value` = "TikTok"
     - `jsp_heard_about_answered` = "true"
     - `jsp_referral_done` = "true"
9. **Refresh page** (F5)
10. **Complete practice again** → Click "Fix my answer"
11. **Verify:** Modal does NOT appear again

### What to Capture:
- ✅ Network tab showing `POST /api/practice/answer` (status 200)
- ✅ Referral modal visible
- ✅ localStorage keys after selection
- ✅ Page refresh
- ✅ Second practice → No modal appears

---

## Test 2: New Signup Flow

### Steps:
1. **Create NEW account:**
   - Email: `test.referral.${Date.now()}@jobspeakpro-test.local`
   - Password: same as email
2. **Complete onboarding** (if shown)
3. **Type answer** in practice textbox
4. **Click "✨ Fix my answer"** button
5. **Wait for results** to appear
6. **Verify:** Referral modal appears
7. **Select option** (e.g., "YouTube")
8. **Show DevTools:**
   - Network tab: Find `PATCH` or `PUT` request to `/profiles` or Supabase endpoint
   - Show request payload: `{ heard_about_us: "YouTube" }`
   - Show response: Status 200/204
9. **Logout** (click avatar → Logout)
10. **Login again** with same account
11. **Complete practice** → Click "Fix my answer"
12. **Verify:** Modal does NOT appear again

### What to Capture:
- ✅ Network tab showing profile update request
- ✅ Request payload with `heard_about_us`
- ✅ Response status 200/204
- ✅ Logout → Login
- ✅ Second practice → No modal appears

---

## Test 3: Guest → Signup Flow

### Steps:
1. **Start as guest** (incognito window)
2. **Complete practice** → Click "Fix my answer"
3. **Referral modal appears** → Select option (e.g., "Discord")
4. **Show DevTools:**
   - Application tab → Local Storage
   - Verify: `jsp_heard_about_value` = "Discord"
5. **DO NOT refresh** - Keep same session
6. **Sign up for account:**
   - Email: `test.sync.${Date.now()}@jobspeakpro-test.local`
   - Password: same as email
7. **After signup/login, show DevTools:**
   - Network tab: Find sync request (PATCH/PUT to `/profiles`)
   - Show request payload: `{ heard_about_us: "Discord" }`
   - Console tab: Look for `[SYNC] Successfully synced referral data to DB`
8. **Complete practice** → Click "Fix my answer"
9. **Verify:** Modal does NOT appear (already answered)

### What to Capture:
- ✅ localStorage before signup
- ✅ Signup process
- ✅ Network tab showing sync request after signup
- ✅ Console log: `[SYNC] Successfully synced referral data to DB`
- ✅ Second practice → No modal appears

---

## Test 4: Daily Limit Flow

### Steps:
1. **Use QA account:** `jsp.qa.104@jobspeakpro-test.local` (password: same)
2. **Complete practice** → Click "✨ Fix my answer" (Attempt #1)
3. **Show DevTools:**
   - Network tab: `POST /api/practice/answer`
   - Status: 200
   - Response: `usage.blocked=false`
4. **Complete practice** → Click "✨ Fix my answer" (Attempt #2)
5. **Show DevTools:**
   - Network tab: `POST /api/practice/answer`
   - Status: 200
   - Response: `usage.blocked=false`
6. **Complete practice** → Click "✨ Fix my answer" (Attempt #3)
7. **Show DevTools:**
   - Network tab: `POST /api/practice/answer`
   - Status: 200 (or 429 if limit is 3)
   - Response: Check `usage.blocked` value
8. **Complete practice** → Click "✨ Fix my answer" (Attempt #4)
9. **Show DevTools:**
   - Network tab: `POST /api/practice/answer`
   - Status: 429
   - Response: `{ blocked: true, upgrade: true, ... }`
10. **Verify UI:**
    - PaywallModal is visible
    - Button is NOT stuck loading
    - No "nothing happened" - always visible feedback

### What to Capture:
- ✅ Attempt #1: Network status 200
- ✅ Attempt #2: Network status 200
- ✅ Attempt #3: Network status 200 (or 429 if limit=3)
- ✅ Attempt #4: Network status 429, response JSON visible
- ✅ PaywallModal visible on attempt #4
- ✅ Button state (not loading) after attempt #4
- ✅ No silent failures at any step

---

## Critical Verification Points

### For Each Test:
1. **Network Tab:**
   - Preserve log enabled
   - Request URL visible
   - Status code visible
   - Response JSON visible (click request → Response tab)

2. **LocalStorage (Guest Tests):**
   - Application tab → Local Storage → `https://jobspeakpro.com`
   - Keys visible: `jsp_heard_about_value`, `jsp_heard_about_answered`, `jsp_referral_done`

3. **Timestamps:**
   - System clock visible OR
   - DevTools Network tab timestamps visible

4. **No Silent Failures:**
   - Every "Fix my answer" click shows:
     - Results (success)
     - PaywallModal (limit reached)
     - Error message (network/500 error)
   - Button never stuck in loading state

---

## Expected Network Requests

### Fix My Answer:
- **URL:** `POST https://jobspeakpro.com/api/practice/answer`
- **Attempts 1-3:** Status 200, `usage.blocked=false`
- **Attempt 4:** Status 429, `{ blocked: true, upgrade: true, ... }`

### Referral Modal Save (Logged-in):
- **URL:** `PATCH https://<supabase-url>/rest/v1/profiles`
- **Payload:** `{ heard_about_us: "<option>" }`
- **Status:** 200/204

### Guest → Signup Sync:
- **URL:** `PATCH https://<supabase-url>/rest/v1/profiles`
- **Payload:** `{ heard_about_us: "<localStorage-value>" }`
- **Status:** 200/204
- **Console:** `[SYNC] Successfully synced referral data to DB`

---

## Code Verification Summary

All code is verified correct:
- ✅ Fix My Answer error handling (429, 402, 403 → PaywallModal)
- ✅ Referral modal for guests (localStorage)
- ✅ Referral modal for logged-in (DB)
- ✅ Guest → signup sync (localStorage to DB)
- ✅ Loading state always clears

**Commits:**
- `7c62e87` - Update referral modal options
- `32dd703` - Add guest support for referral modal

---

## Recording Tips

1. **Pause between tests** to clearly separate each test
2. **Zoom in on DevTools** when showing network requests/localStorage
3. **Speak clearly** explaining what you're showing
4. **Show timestamps** at key moments
5. **Verify each step** before moving to next

---

## Completion Checklist

- [ ] Test 1: Guest incognito flow recorded
- [ ] Test 2: New signup flow recorded
- [ ] Test 3: Guest → signup flow recorded
- [ ] Test 4: Daily limit flow recorded
- [ ] All network requests visible with status codes
- [ ] localStorage keys visible (guest tests)
- [ ] PaywallModal visible on attempt #4
- [ ] No silent failures at any step
- [ ] Timestamps visible throughout

