# Guest Referral Modal Test Plan

## Implementation Summary
- ✅ Referral modal now works for **both guests and logged-in users**
- ✅ Guests: Save to `localStorage` (`jsp_heard_about_value`, `jsp_heard_about_answered`)
- ✅ Logged-in: Save to database (`profiles.heard_about_us`)
- ✅ Sync: When guest signs up/logs in, localStorage value syncs to DB (write-once: only if DB is NULL)

## Test Cases (Minimum 3)

### Test 1: Guest Flow
**Goal**: Verify guest can answer referral modal, selection persists, no nagging

**Steps**:
1. Open browser in **incognito/private mode** (fresh guest session)
2. Navigate to `https://jobspeakpro.com/practice`
3. Complete onboarding (if shown)
4. Complete 1 practice question → Click "Fix My Answer" → Wait for results
5. **Expected**: Referral modal appears
6. Select an option (e.g., "TikTok")
7. **Verify**:
   - Modal closes
   - Check DevTools Console → `localStorage.getItem("jsp_heard_about_value")` = "TikTok"
   - Check `localStorage.getItem("jsp_heard_about_answered")` = "true"
   - Check `localStorage.getItem("jsp_referral_done")` = "true"
8. Refresh page → Complete another practice → Fix My Answer
9. **Expected**: Referral modal does NOT appear again

**Pass Criteria**:
- ✅ Modal appears after first successful Fix My Answer
- ✅ Selection saves to localStorage
- ✅ Modal never shows again after answering

---

### Test 2: New Signup Flow
**Goal**: Verify new user sees modal, saves to DB, no nagging

**Steps**:
1. Create **NEW** account (not existing QA user)
   - Email: `test.referral.${Date.now()}@jobspeakpro-test.local`
   - Password: same as email
2. Complete onboarding
3. Complete 1 practice question → Click "Fix My Answer" → Wait for results
4. **Expected**: Referral modal appears
5. Select an option (e.g., "YouTube")
6. **Verify**:
   - Modal closes
   - Check database: `SELECT heard_about_us FROM profiles WHERE id = '<user_id>'` = "YouTube"
   - Check DevTools Console → `localStorage.getItem("jsp_referral_done")` = "true"
7. Refresh page → Complete another practice → Fix My Answer
8. **Expected**: Referral modal does NOT appear again
9. Logout → Login again
10. Complete practice → Fix My Answer
11. **Expected**: Referral modal does NOT appear (DB already has value)

**Pass Criteria**:
- ✅ Modal appears after first successful Fix My Answer
- ✅ Selection saves to database
- ✅ Modal never shows again (even after refresh/relogin)

---

### Test 3: Guest → Signup Flow
**Goal**: Verify localStorage value syncs to DB when guest signs up

**Steps**:
1. Open browser in **incognito/private mode** (fresh guest session)
2. Navigate to `https://jobspeakpro.com/practice`
3. Complete onboarding (if shown)
4. Complete 1 practice → Click "Fix My Answer" → Wait for results
5. **Expected**: Referral modal appears
6. Select an option (e.g., "Discord")
7. **Verify**:
   - `localStorage.getItem("jsp_heard_about_value")` = "Discord"
   - `localStorage.getItem("jsp_heard_about_answered")` = "true"
8. **DO NOT refresh** - Keep same session
9. Sign up for account:
   - Email: `test.sync.${Date.now()}@jobspeakpro-test.local`
   - Password: same as email
10. After signup/login, **verify**:
    - Check database: `SELECT heard_about_us FROM profiles WHERE id = '<user_id>'` = "Discord"
    - Console log should show: `[SYNC] Successfully synced referral data to DB`
11. Complete another practice → Fix My Answer
12. **Expected**: Referral modal does NOT appear (already answered)

**Pass Criteria**:
- ✅ Guest selection saved to localStorage
- ✅ After signup, value syncs to database
- ✅ Modal never shows again after sync

---

### Test 4: Fix My Answer Limit Flow (Verification)
**Goal**: Verify Fix My Answer limit handling (attempts 1-3 work, attempt 4 shows paywall)

**Steps**:
1. Use QA account: `jsp.qa.104@jobspeakpro-test.local` (password: same)
2. Complete practice → Click "Fix My Answer" (Attempt #1)
3. **Expected**: Results appear
4. Complete practice → Click "Fix My Answer" (Attempt #2)
5. **Expected**: Results appear
6. Complete practice → Click "Fix My Answer" (Attempt #3)
7. **Expected**: Results appear OR paywall/message (NOT silent)
8. Complete practice → Click "Fix My Answer" (Attempt #4)
9. **Expected**: PaywallModal appears OR clear limit message (NOT silent)
10. **Verify**:
    - Button never stuck in loading state
    - No "nothing happened" - always visible feedback

**Pass Criteria**:
- ✅ Attempts 1-3: All show results or clear feedback
- ✅ Attempt 4: Shows PaywallModal or error message
- ✅ No silent failures
- ✅ Loading state always clears

---

## Network Verification (Optional)
For Test 4, capture Network tab screenshot:
- Filter: `practice/answer`
- Show attempt #3 request: `POST https://jobspeakpro.com/api/practice/answer`
- Status + full JSON response visible

---

## Commit Hash
Current commit: `32dd703` - Add guest support for referral modal

