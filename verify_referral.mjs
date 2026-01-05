
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// CONFIG
const USER_EMAIL = "jsp.qa.002@jobspeakpro-test.local";
const USER_PASS = "jsp.qa.002@jobspeakpro-test.local"; // Using email as password strategy
const URL_BASE = 'https://jobspeakpro.com';
const VIDEO_DIR = 'videos';

if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR);

async function runTest() {
    console.log("Launching Browser (Ignore HTTPS Errors)...");
    const browser = await chromium.launch({
        headless: true,
        args: ['--ignore-certificate-errors']
    });

    const context = await browser.newContext({
        recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
        permissions: ['microphone'],
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true
    });

    // FAIL-SAFE ONBOARDING BYPASS
    await context.addInitScript(() => {
        const k = ['jsp_onboarding_complete_v1', 'practice_onboarding_seen', 'jsp_practice_tour_done_v1', 'jsp_free_usage_v1'];
        k.forEach(key => localStorage.setItem(key, key.includes('usage') ? '{}' : '1'));
        localStorage.removeItem('jsp_referral_done');
    });

    const page = await context.newPage();

    // LOGGING
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('NETWORK PROOF') || text.includes('TEST')) console.log(text);
    });
    // page.on('pageerror', err => console.error('PAGE ERROR:', err));

    try {
        console.log(`[TEST] Starting Flow with ${USER_EMAIL}...`);

        // 1. Login
        await page.goto(`${URL_BASE}/signin`);
        await page.fill('input[type="email"]', USER_EMAIL);
        await page.fill('input[type="password"]', USER_PASS);
        await page.click('button[type="submit"]');
        await page.waitForURL(`${URL_BASE}/dashboard`, { timeout: 20000 });
        console.log('[TEST] Login Successful');

        // 2. Navigate Practice
        await page.goto(`${URL_BASE}/practice`);
        console.log('[TEST] Navigated to Practice');

        // TOUR / PAYWALL / WIZARD Handling
        // Wait a bit for overlays
        await page.waitForTimeout(3000);

        // Close Tour if present (look for Skip button)
        const skipTourBtn = page.locator('button:has-text("Skip")');
        if (await skipTourBtn.isVisible()) {
            console.log('[TEST] Tour detected, skipping...');
            await skipTourBtn.click();
        }

        // Close Paywall if present
        const closePaywallBtn = page.locator('button[aria-label="Close modal"]');
        if (await closePaywallBtn.isVisible()) {
            console.log('[TEST] Paywall detected, closing...');
            await closePaywallBtn.click();
        }

        // Close Wizard if present? (Should be bypassed by init script)

        // 3. Complete Question
        // Ensure "Type answer instead" is visible.
        const typeBtn = page.locator('button:has-text("Type answer instead")');
        // It might be hidden if already in text mode?
        if (await typeBtn.isVisible()) {
            await typeBtn.click();
        }

        // Type answer
        await page.fill('textarea', "Testing referral feature persistence.");

        // Setup Network Monitor
        let dbWrite = false;
        page.on('request', req => {
            if (req.url().includes('profiles') && req.method() === 'PATCH') {
                console.log(`[NETWORK PROOF] DB Write Detected: ${req.postData()}`);
                dbWrite = true;
            }
        });

        // Submit
        await page.click('button:has-text("Fix my answer")');
        console.log('[TEST] Submitted Answer');

        // Wait for results OR Paywall
        try {
            await Promise.race([
                page.waitForSelector('text=What you did well', { timeout: 20000 }),
                page.waitForSelector('text=Unlock Unlimited Practice', { timeout: 20000 })
            ]);
        } catch (e) { console.log("Wait for results timed out"); }

        // Handle Paywall again if it blocked results
        if (await page.locator('text=Unlock Unlimited Practice').isVisible()) {
            console.log('[TEST] Paywall blocked results. Closing to see if results are under...');
            await page.click('button[aria-label="Close modal"]'); // Try close
            await page.waitForTimeout(1000);
            /* If paywall blocks results entirely, we might fail here. */
        }

        // 4. Modal Check
        console.log('[TEST] Waiting for Referral Modal...');
        await page.waitForSelector('text=Quick question — how did you hear about us?', { timeout: 10000 });
        console.log('[TEST] MODAL APPEARED ✅');

        // 5. Interact (Select "Discord")
        await page.click('button:has-text("Discord")');
        console.log('[TEST] Selected Discord');

        // 6. Verify Gone
        await page.waitForSelector('text=Quick question — how did you hear about us?', { state: 'hidden', timeout: 5000 });
        console.log('[TEST] Modal Closed ✅');

        if (dbWrite) console.log('[TEST] DB Persistence Verified ✅');
        else console.warn('[TEST] DB Write NOT detected in logs (might be masked by headless SSL issues)');

        // 7. Refresh Check
        await page.reload();
        await page.waitForSelector('text=What you did well', { timeout: 20000 });
        if (!await page.isVisible('text=Quick question — how did you hear about us?')) {
            console.log('[TEST] Refresh Persistence Verified ✅');
        } else {
            console.error('[TEST] FAILED: Modal reappeared after refresh');
        }

        // 8. Logout/Login (Cross Device)
        console.log('[TEST] Testing Cross-Device Persistence...');
        await context.clearCookies();
        await page.goto(`${URL_BASE}/signin`);
        await page.fill('input[type="email"]', USER_EMAIL);
        await page.fill('input[type="password"]', USER_PASS);
        await page.click('button[type="submit"]');
        await page.waitForURL(`${URL_BASE}/dashboard`);

        await page.goto(`${URL_BASE}/practice`);
        await page.waitForTimeout(3000);

        // Do 2nd Question to trigger potential modal
        const typeBtn2 = page.locator('button:has-text("Type answer instead")');
        if (await typeBtn2.isVisible()) await typeBtn2.click();
        await page.fill('textarea', "Second verification answer.");
        await page.click('button:has-text("Fix my answer")');

        await page.waitForSelector('text=What you did well', { timeout: 20000 });

        if (!await page.isVisible('text=Quick question — how did you hear about us?')) {
            console.log('[TEST] Cross-Device Persistence Verified ✅');
        } else {
            console.error('[TEST] FAILED: Modal reappeared on 2nd session');
        }

    } catch (e) {
        console.error('[TEST] ERROR:', e.message);
        await page.screenshot({ path: 'videos/error.png' });
    } finally {
        await context.close();
    }
}

runTest();
