# Post-Deployment Instructions

## Status
✅ **Frontend deployed**: Commit `5ebf462` pushed to production
- Stable `data-testid` selectors are live
- Playwright test suite ready
- Billing error handling verified

## Next Steps (After Backend is Fixed)

### 1. Verify Backend is Live
Check that backend accepts requests to `/api/affiliate/apply`

### 2. Run Production Verification
```bash
node verify_stable_selectors.cjs https://jobspeakpro.com
```

### 3. Create V2 Proof Folder
If test passes, move artifacts to versioned folder:
```bash
mkdir docs/proofs/2026-01-24_fix_v4_v2
mv docs/proofs/2026-01-24_fix_v4/test_*.png docs/proofs/2026-01-24_fix_v4_v2/
mv docs/proofs/2026-01-24_fix_v4/test_recording.webm docs/proofs/2026-01-24_fix_v4_v2/
```

### 4. Expected Results
- ✅ Form fills using stable selectors
- ✅ Submission hits `/api/affiliate/apply`
- ✅ Backend returns 200/redirect (not 404)
- ✅ User redirected to `/affiliate/joined`

## Current Blockers
- Backend `/api/affiliate/apply` endpoint not responding (404/network error)
- Once backend is fixed, frontend will work immediately (no redeploy needed)
