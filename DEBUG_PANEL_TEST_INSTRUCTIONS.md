# Debug Panel Test Instructions

## Setup

1. **Navigate to practice page with debug mode:**
   ```
   https://jobspeakpro.com/practice?debug=1
   ```

2. **Debug panel appears in top-right corner** showing:
   - User State (guest/logged-in + userId)
   - Fix My Answer attempt count
   - Last API response status + timestamp
   - Referral state (localStorage + DB)
   - Paywall state

## Test 1: Guest Incognito Flow

1. Open **incognito window** → Navigate to `https://jobspeakpro.com/practice?debug=1`
2. Complete onboarding (if shown)
3. Type answer → Click "✨ Fix my answer"
4. **Watch debug panel:**
   - Last API Status: Should show `200`
   - Fix My Answer Attempts: Should increment
5. **Referral modal appears** → Select option (e.g., "TikTok")
6. **Watch debug panel:**
   - Referral modal triggered: YES (with timestamp)
   - localStorage jsp_heard_about_answered: "true"
   - localStorage jsp_heard_about_value: "TikTok"
7. **Refresh page** → Complete practice → Fix my answer
8. **Verify:** Modal does NOT appear, debug panel shows referral already answered

**Screenshot/Video:** Show debug panel + Network tab + localStorage

---

## Test 2: New Signup Flow

1. Create **NEW account** → Navigate to `https://jobspeakpro.com/practice?debug=1`
2. Complete onboarding
3. Type answer → Click "✨ Fix my answer"
4. **Watch debug panel:**
   - User State: Logged-in (userId visible)
   - Last API Status: `200`
5. **Referral modal appears** → Select option (e.g., "YouTube")
6. **Watch debug panel:**
   - Referral modal triggered: YES
   - profile heard_about_us: Should update to "YouTube" (may take a moment)
7. **Show Network tab:** Find PATCH/PUT to `/profiles` with `heard_about_us: "YouTube"`
8. **Logout** → **Login** → Complete practice → Fix my answer
9. **Verify:** Modal does NOT appear, debug panel shows profile already has value

**Screenshot/Video:** Show debug panel + Network tab showing DB write

---

## Test 3: Guest → Signup Flow

1. **Start as guest** (incognito) → Navigate to `https://jobspeakpro.com/practice?debug=1`
2. Complete practice → Fix my answer
3. **Referral modal appears** → Select option (e.g., "Discord")
4. **Watch debug panel:**
   - User State: Guest
   - localStorage jsp_heard_about_value: "Discord"
   - Referral modal triggered: YES
5. **DO NOT refresh** - Sign up for account
6. **After signup/login, watch debug panel:**
   - User State: Changes to Logged-in (userId visible)
   - profile heard_about_us: Should update to "Discord" (sync happens)
7. **Show Network tab:** Find sync request (PATCH/PUT to `/profiles`)
8. **Show Console:** Look for `[SYNC] Successfully synced referral data to DB`
9. Complete practice → Fix my answer
10. **Verify:** Modal does NOT appear (already answered)

**Screenshot/Video:** Show debug panel before signup, after signup, Network tab sync request

---

## Test 4: Daily Limit Flow

1. **Use QA account:** `jsp.qa.104@jobspeakpro-test.local` → Navigate to `https://jobspeakpro.com/practice?debug=1`
2. Complete practice → Click "✨ Fix my answer" (Attempt #1)
3. **Watch debug panel:**
   - Last API Status: `200`
   - Fix My Answer Attempts: 1 / 3
4. Complete practice → Click "✨ Fix my answer" (Attempt #2)
5. **Watch debug panel:**
   - Last API Status: `200`
   - Fix My Answer Attempts: 2 / 3
6. Complete practice → Click "✨ Fix my answer" (Attempt #3)
7. **Watch debug panel:**
   - Last API Status: `200` (or `429` if limit is 3)
   - Fix My Answer Attempts: 3 / 3
8. Complete practice → Click "✨ Fix my answer" (Attempt #4)
9. **Watch debug panel:**
   - Last API Status: `429`
   - Paywall opened: YES (with timestamp)
10. **Verify UI:**
    - PaywallModal is visible
    - Button is NOT stuck loading
    - No "nothing happened" - always visible feedback

**Screenshot/Video:** Show debug panel for each attempt, Network tab showing 429 on attempt 4, PaywallModal visible

---

## What to Capture

For each test, capture:
1. **Debug panel** showing all states
2. **Network tab** showing API requests/responses
3. **Console** (for sync logs)
4. **UI** showing modals/paywall

**Critical:** Every "Fix my answer" click must show:
- Results (success)
- PaywallModal (limit reached)
- Error message (network/500 error)
- **NEVER silent** - debug panel shows API status for every click

---

## Commit Hash

Current commit: `56b80d8` - Add debug panel (?debug=1)

