# Production QA Test Plan - "Fix my answer" Limit Handling

## Test Objective
Verify that "Fix my answer" does NOT silently fail and shows paywall/limit message when daily limit is reached (free = 3/day → block on 4th attempt).

## Test Account
- **Email**: `jsp.qa.104@jobspeakpro-test.local`
- **Password**: `jsp.qa.104@jobspeakpro-test.local`
- **URL**: https://jobspeakpro.com

## Pre-Test Checklist
- [ ] Screen recording software ready (OBS, QuickTime, Windows Game Bar, etc.)
- [ ] Browser: Chrome or Firefox (latest version)
- [ ] Clear browser cache/cookies OR use incognito/private mode
- [ ] Ensure account has 0/3 usage for today (fresh start)

## Test Steps (Record ALL steps in ONE continuous recording)

### Step 1: Login
1. Navigate to https://jobspeakpro.com
2. Click "Log In" or navigate to /signin
3. Enter email: `jsp.qa.104@jobspeakpro-test.local`
4. Enter password: `jsp.qa.104@jobspeakpro-test.local`
5. Click "Log In" button
6. **VERIFY**: Successfully logged in (should see dashboard or practice page)

### Step 2: Navigate to Practice
1. Click "Practice" in navigation or navigate to /practice
2. **VERIFY**: Practice page loads with question displayed

### Step 3: Complete First Practice & Fix #1
1. Type or record an answer to the practice question
2. Click "✨ Fix my answer" button
3. **VERIFY**: 
   - Loading state shows ("Improving...")
   - Results appear (improved answer, feedback, etc.)
   - Button returns to normal state (not stuck)
   - Usage counter shows: "You've used 1 of 3 free practice questions"

### Step 4: Fix my answer #2
1. Type or record a new answer (or use "Practice Again" if available)
2. Click "✨ Fix my answer" button
3. **VERIFY**:
   - Loading state shows
   - Results appear successfully
   - Button returns to normal state
   - Usage counter shows: "You've used 2 of 3 free practice questions"

### Step 5: Fix my answer #3
1. Type or record a new answer
2. Click "✨ Fix my answer" button
3. **VERIFY**:
   - Loading state shows
   - Results appear successfully
   - Button returns to normal state
   - Usage counter shows: "You've used 3 of 3 free practice questions"

### Step 6: Fix my answer #4 (CRITICAL TEST)
1. Type or record a new answer
2. Click "✨ Fix my answer" button
3. **CRITICAL VERIFICATION**:
   - **MUST SHOW**: PaywallModal OR clear limit message (e.g., "You've reached your daily limit")
   - **MUST NOT**: Silent failure (nothing happens, button does nothing)
   - **MUST NOT**: Button stuck in loading state
   - **MUST NOT**: No error message or feedback
   - Loading state clears properly
   - Button returns to clickable state (even if disabled)

## Expected Results

### ✅ PASS Criteria
- [ ] Attempts 1-3: All show results successfully
- [ ] Attempt 4: Shows PaywallModal OR clear limit message
- [ ] No silent failures at any point
- [ ] Loading state always clears
- [ ] Button never stuck in loading state
- [ ] Usage counter updates correctly (1/3, 2/3, 3/3)

### ❌ FAIL Criteria
- [ ] Attempt 4: Nothing happens (silent failure)
- [ ] Attempt 4: Button stuck in loading state
- [ ] Attempt 4: No error message or paywall shown
- [ ] Any attempt: Button becomes unresponsive
- [ ] Loading state doesn't clear

## Deliverables

### 1. Screen Recording
- **Format**: MP4, MOV, or WebM
- **Duration**: Should show all 6 steps continuously
- **Quality**: Clear enough to read text and see button states
- **Naming**: `fix-my-answer-limit-test-YYYY-MM-DD-HHMM.mp4`

### 2. Green-Check Report
Complete the report template below.

---

## Green-Check Report Template

```markdown
# Production QA Test Report - "Fix my answer" Limit Handling

**Date**: [YYYY-MM-DD]
**Tester**: [Name]
**Test Account**: jsp.qa.104@jobspeakpro-test.local
**Browser**: [Chrome/Firefox] Version [X.X.X]
**Recording File**: [filename.mp4]

## Test Results

### Step 1: Login
- [ ] ✅ PASS - Successfully logged in
- [ ] ❌ FAIL - [Describe issue]

### Step 2: Navigate to Practice
- [ ] ✅ PASS - Practice page loaded
- [ ] ❌ FAIL - [Describe issue]

### Step 3: Fix my answer #1
- [ ] ✅ PASS - Results shown, loading cleared
- [ ] ❌ FAIL - [Describe issue]
- Usage counter: [1/3 or actual value]

### Step 4: Fix my answer #2
- [ ] ✅ PASS - Results shown, loading cleared
- [ ] ❌ FAIL - [Describe issue]
- Usage counter: [2/3 or actual value]

### Step 5: Fix my answer #3
- [ ] ✅ PASS - Results shown, loading cleared
- [ ] ❌ FAIL - [Describe issue]
- Usage counter: [3/3 or actual value]

### Step 6: Fix my answer #4 (CRITICAL)
- [ ] ✅ PASS - PaywallModal shown
- [ ] ✅ PASS - Clear limit message shown (alternative)
- [ ] ❌ FAIL - Silent failure (nothing happened)
- [ ] ❌ FAIL - Button stuck in loading
- [ ] ❌ FAIL - No error/paywall shown
- Loading state cleared: [ ] ✅ YES [ ] ❌ NO
- Button state: [ ] ✅ Normal [ ] ❌ Stuck [ ] ❌ Disabled incorrectly

## Overall Result

- [ ] ✅ **PASS** - All criteria met, no silent failures
- [ ] ❌ **FAIL** - Silent failure or other critical issue

## Issues Found

[List any issues, bugs, or unexpected behavior]

## Screenshots/Timestamps

- Attempt 1 result: [timestamp in recording]
- Attempt 2 result: [timestamp in recording]
- Attempt 3 result: [timestamp in recording]
- Attempt 4 (limit hit): [timestamp in recording]
- PaywallModal appearance: [timestamp in recording]

## Notes

[Any additional observations or comments]
```

---

## Quick Reference: What to Look For

### ✅ GOOD (Expected Behavior)
- PaywallModal appears on 4th attempt
- Clear message: "You've reached your daily limit"
- Button shows "Improving..." then returns to normal
- Usage counter updates: 1/3 → 2/3 → 3/3

### ❌ BAD (Bug - Silent Failure)
- Clicking "Fix my answer" on 4th attempt does nothing
- Button appears clickable but nothing happens
- No error message, no paywall, no feedback
- Button stuck showing "Improving..." forever

---

## Troubleshooting

If login fails:
- Verify account exists and password is correct
- Try clearing browser cache/cookies
- Check if account is locked or needs activation

If practice page doesn't load:
- Check browser console for errors (F12)
- Verify network connection
- Try refreshing page

If limit doesn't trigger:
- Verify backend is deployed with correct limit rules
- Check if account already has usage from previous tests
- May need to wait for daily reset or use different account

---

**END OF TEST PLAN**

