# Production Test Proof - Required Evidence

## Test Requirements Summary

### Ship Requirements (Must be true in production):
1. ✅ Fix My Answer can NEVER be silent - Every click shows: Results OR Paywall OR Error message
2. ✅ Attempt 4 (free) MUST ALWAYS show paywall (backend returns 429, frontend catches it)
3. ✅ Referral modal works for GUESTS + LOGGED-IN
4. ✅ Guest → login/signup: localStorage syncs to DB ONCE

### Test Cases to Execute:

## Test 1: Guest Flow (Incognito)
**Steps**:
1. Open incognito browser → Navigate to `https://jobspeakpro.com/practice`
2. Skip onboarding
3. Type answer → Click "Fix My Answer" → Wait for results
4. **Expected**: Referral modal appears
5. Select option (e.g., "TikTok")
6. **Verify localStorage**:
   - `jsp_heard_about_answered` = "true"
   - `jsp_heard_about_value` = "TikTok"
   - `jsp_referral_done` = "true"
7. Refresh page → Complete practice → Fix My Answer
8. **Expected**: Modal does NOT appear

**Proof Required**:
- Screenshot: localStorage keys after selection
- Screenshot: Network tab showing `/api/practice/answer` request (status 200)
- Screenshot: Referral modal visible
- Screenshot: Page after refresh showing no modal

---

## Test 2: New Signup Flow
**Steps**:
1. Create NEW account: `test.referral.${Date.now()}@jobspeakpro-test.local`
2. Complete onboarding
3. Complete practice → Fix My Answer → Wait for results
4. **Expected**: Referral modal appears
5. Select option (e.g., "YouTube")
6. **Verify DB**:
   - Query: `SELECT heard_about_us FROM profiles WHERE email = '<email>'`
   - Should return: "YouTube"
7. **Verify Network**:
   - Network tab showing PATCH/PUT to `/profiles` with `heard_about_us: "YouTube"`
8. Logout → Login → Complete practice → Fix My Answer
9. **Expected**: Modal does NOT appear

**Proof Required**:
- Screenshot: Network tab showing profile update request
- Screenshot: DB query result showing `heard_about_us = "YouTube"`
- Screenshot: After relogin, no modal appears

---

## Test 3: Guest → Signup Flow
**Steps**:
1. Guest session (incognito) → Complete practice → Fix My Answer
2. Referral modal appears → Select "Discord"
3. **Verify localStorage**:
   - `jsp_heard_about_value` = "Discord"
   - `jsp_heard_about_answered` = "true"
4. **DO NOT refresh** - Sign up with new account
5. **Verify sync**:
   - Console log: `[SYNC] Successfully synced referral data to DB`
   - Network tab: PATCH/PUT to `/profiles` with `heard_about_us: "Discord"`
   - DB query: `SELECT heard_about_us FROM profiles WHERE id = '<user_id>'` = "Discord"
6. Complete practice → Fix My Answer
7. **Expected**: Modal does NOT appear (already answered)

**Proof Required**:
- Screenshot: localStorage before signup
- Screenshot: Network tab showing sync request
- Screenshot: Console log showing `[SYNC] Successfully synced`
- Screenshot: DB query result
- Screenshot: After signup, no modal appears

---

## Test 4: Daily Limit Flow
**Steps**:
1. Use QA account: `jsp.qa.104@jobspeakpro-test.local`
2. Complete practice → Click "Fix My Answer" (Attempt #1)
3. **Expected**: Results appear, status 200
4. Complete practice → Click "Fix My Answer" (Attempt #2)
5. **Expected**: Results appear, status 200
6. Complete practice → Click "Fix My Answer" (Attempt #3)
7. **Expected**: Results appear OR paywall (NOT silent), status 200
8. Complete practice → Click "Fix My Answer" (Attempt #4)
9. **Expected**: PaywallModal appears, status 429
10. **Verify**:
    - Network tab: Request to `/api/practice/answer` shows status 429
    - Response JSON: Contains `blocked: true` or `upgrade: true`
    - UI: PaywallModal is visible
    - Button: NOT stuck in loading state

**Proof Required**:
- Screenshot: Network tab for attempt #1 (status 200)
- Screenshot: Network tab for attempt #2 (status 200)
- Screenshot: Network tab for attempt #3 (status 200)
- Screenshot: Network tab for attempt #4 (status 429, response JSON visible)
- Screenshot: PaywallModal visible on attempt #4
- Screenshot: Button state (not loading) after attempt #4

---

## Current Implementation Status

### Code Changes:
- ✅ `ReferralSurveyModal.jsx`: Supports guests (localStorage) and logged-in (DB)
- ✅ `PracticeSpeakingPage.jsx`: Trigger logic for both guests and logged-in
- ✅ `AuthContext.jsx`: Sync logic for guest → logged-in
- ✅ `usePracticeSession.js`: Comprehensive error handling for Fix My Answer (429, 402, 403)
- ✅ `PaywallModal.jsx`: Rendered correctly in PracticeSpeakingPage

### Commit Hash:
- `7c62e87` - Update referral modal options
- `32dd703` - Add guest support for referral modal

### Next Steps:
Execute all 4 tests and capture proof as specified above.

