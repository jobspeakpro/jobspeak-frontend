# Sanity Checklist - Post-Restart Verification

## Quick Verification Steps

### ✅ 1. `/practice` Route Loads
- **Expected**: Navigate to `/practice` and see the Practice Speaking page
- **Route**: Configured in `src/main.jsx` → `PracticeSpeakingPage` component
- **Check**: Page should display question card, mic button, and practice interface

### ✅ 2. Mic Click Triggers `/api/stt` Network Request
- **Expected**: Clicking mic button should trigger a POST request to `/api/stt` in Network tab
- **Response**: Should return JSON (not HTML)
- **Implementation**: `VoiceRecorder.jsx` calls `/api/stt` via `apiClient`
- **Check**: 
  - Open DevTools → Network tab
  - Click mic button
  - Look for POST request to `/api/stt`
  - Verify response is JSON with `transcript` or `text` field

### ✅ 3. Daily Limit Hit → PaywallModal Opens
- **Expected**: When daily limit is reached, `PaywallModal` should open automatically
- **Implementation**: 
  - `VoiceRecorder.jsx` checks usage before starting recording
  - If blocked, calls `onUpgradeNeeded("mic")` callback
  - `PracticeSpeakingPage.jsx` handles callback and sets `showPaywall` state
- **Check**:
  - Use up all free attempts (3 for free users)
  - Click mic button
  - `PaywallModal` should appear with upgrade options

### ✅ 4. Mic Button Disabled Styles During Transcribing
- **Expected**: Mic button should show disabled styles (opacity-60, cursor-not-allowed) while transcribing
- **Implementation**: 
  - Button has `disabled={transcribing}` prop
  - Classes: `disabled:opacity-60 disabled:cursor-not-allowed`
- **Check**:
  - Click mic, record audio, stop recording
  - While transcribing, button should appear dimmed and cursor should be not-allowed

---

## Backend Endpoint Verification

### Curl Test Results

**Test 1: `/api/stt` endpoint**
```bash
curl -i https://jobspeak-backend-production.up.railway.app/api/stt
```
**Result**: `404 Not Found` with JSON `{"error":"Not found"}`

**Test 2: `/stt` endpoint**
```bash
curl -i https://jobspeak-backend-production.up.railway.app/stt
```
**Result**: `404 Not Found` with JSON `{"error":"Not found"}`

### Proxy Configuration Analysis

**Current Vercel Config** (`vercel.json`):
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://jobspeak-backend-production.up.railway.app/api/:path*" }
  ]
}
```

**Frontend Implementation** (`VoiceRecorder.jsx`):
- Uses relative path: `/api/stt`
- Vercel proxy should route: `/api/stt` → `https://jobspeak-backend-production.up.railway.app/api/stt`

### Proxy Case Determination

Since both endpoints return 404 when called directly, we need to determine:

**Case A**: Backend expects `/api/stt` (matches current proxy config)
- Frontend: `/api/stt` (relative)
- Vercel proxy: `/api/stt` → `https://jobspeak-backend-production.up.railway.app/api/stt`
- ✅ Current implementation should work

**Case B**: Backend expects `/stt` (needs proxy config change)
- Frontend: `/api/stt` (relative)
- Vercel proxy: `/api/stt` → `https://jobspeak-backend-production.up.railway.app/stt`
- ⚠️ Would need to update `vercel.json` rewrite rule

**Recommendation**: Check backend codebase to confirm actual endpoint path. The 404 responses suggest the endpoints may require authentication or specific request methods (POST with FormData).

---

## Implementation Details

### STT API Call Flow
1. User clicks mic button → `startRecording()` in `VoiceRecorder.jsx`
2. Checks usage limit (if free user) → blocks if limit reached
3. Requests microphone permission
4. Records audio
5. On stop → creates FormData with audio file
6. Calls `apiClient("/api/stt", { method: "POST", body: formData })`
7. Vercel proxy routes to backend
8. Backend processes and returns JSON with transcript

### PaywallModal Trigger Points
1. **Before recording starts**: Usage check in `startRecording()` → `onUpgradeNeeded("mic")`
2. **After STT returns 429**: Error handler in `VoiceRecorder.jsx` → `onUpgradeNeeded("mic")`
3. **After STT returns 402**: Error handler in `VoiceRecorder.jsx` → `onUpgradeNeeded("mic")`

### Disabled State Management
- `transcribing` state set to `true` when STT request starts
- `transcribing` state set to `false` when STT completes or errors
- Button `disabled` prop bound to `transcribing` state
- CSS classes: `disabled:opacity-60 disabled:cursor-not-allowed`

---

## Testing Checklist

- [ ] Navigate to `/practice` - page loads correctly
- [ ] Click mic button - Network tab shows POST to `/api/stt`
- [ ] Verify response is JSON (not HTML)
- [ ] Use up all free attempts (3/3)
- [ ] Click mic button - PaywallModal opens
- [ ] Record audio and stop - mic button shows disabled styles during transcribing
- [ ] Verify transcript appears in text area after STT completes

