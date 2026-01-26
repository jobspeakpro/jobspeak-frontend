const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URL = process.argv[2] || 'https://jobspeakpro.com';
const PROOF_DIR = path.join(__dirname, 'docs/proofs/2026-01-24_fix_v4');

if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
}

// Helper to log
const log = (msg) => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] ${msg}`);
};

(async () => {
    log(`🚀 Starting Final Verification (Playwright) on ${TARGET_URL}...`);
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });

    // Capture Alerts/Dialogs
    page.on('dialog', async dialog => {
        log(`📢 Alert/Dialog Detected: ${dialog.message()}`);
        await dialog.dismiss();
    });

    try {
        // --- 1. Referral Page Verification (Requires Auth) ---
        // We will attempt auth, but if it fails, we proceed to Affiliate check.
        log('🔐 1. Registering New User to verify /referral...');
        var authSuccess = false;
        try {
            await page.goto(`${TARGET_URL}/signup`, { waitUntil: 'networkidle' });

            const timestamp = Date.now();
            const email = `verify_${timestamp}@test.com`;
            const password = 'Password123!';

            // Fill Sign Up
            await page.fill('input[type="email"]', email);
            await page.fill('input[type="password"]', password);

            const submitBtn = await page.$('button[type="submit"]');
            if (submitBtn) {
                await submitBtn.click();
                // Wait for redirect to NOT be /signup
                await page.waitForURL(url => !url.href.includes('/signup'), { timeout: 15000 });
                log('🔐 Signup successful (redirected).');
                authSuccess = true;
            } else {
                log('❌ Could not find Sign Up button');
            }
        } catch (e) {
            log(`⚠️ Auth Attempt Failed: ${e.message}`);
            await page.screenshot({ path: path.join(PROOF_DIR, '07_auth_fail.png') });
        }

        if (authSuccess) {
            log('➡️ Navigating to /referral...');
            await page.goto(`${TARGET_URL}/referral`, { waitUntil: 'networkidle' });

            // Wait for "Your Unique Invite Link"
            try {
                const headingVisible = await page.isVisible('text=Your Unique Invite Link');
                if (headingVisible) {
                    log('✅ Reached /referral page!');
                    await page.screenshot({ path: path.join(PROOF_DIR, '07_referral_page_visible.png') });

                    // Find Copy Button "Copy Link"
                    const copyBtn = await page.getByText('Copy Link');
                    if (await copyBtn.isVisible()) {
                        log('🖱️ Clicking Copy Link button...');
                        await copyBtn.click();

                        // Check button text change to "Copied!"
                        try {
                            await page.waitForSelector('text=Copied!', { timeout: 5000 });
                            log('✅ Copy verification SUCCESS: Button text changed to "Copied!"');
                            await page.screenshot({ path: path.join(PROOF_DIR, '08_referral_copy_toast.png') });
                        } catch (e) {
                            log(`⚠️ Copy verification: Did not see "Copied!" text.`);
                        }
                    } else {
                        log('❌ Copy Link button not found');
                    }
                } else {
                    log('❌ Did not reach /referral (Page loaded but heading missing)');
                    await page.screenshot({ path: path.join(PROOF_DIR, '07_fail_referral_content.png') });
                }
            } catch (e) {
                log('❌ Failed to load /referral');
                await page.screenshot({ path: path.join(PROOF_DIR, '07_fail_referral_load.png') });
            }
        } else {
            log('⏭️ Skipping Referral Check due to Auth Failure.');
        }

        // --- 2. Affiliate Apply Verification ---
        log('🤝 2. Verifying Affiliate Application...');
        const affiliateUrl = `${TARGET_URL}/affiliate/apply`;
        await page.goto(affiliateUrl, { waitUntil: 'networkidle' });

        // Use IDs based on AffiliateJoinPage.jsx
        await page.fill('#full-name', 'Verification Bot');
        await page.fill('#email', `affiliate_${Date.now()}@test.com`);
        await page.selectOption('#country', 'US');
        await page.selectOption('#platform', 'twitter');
        // No handle field, uses #link
        await page.selectOption('#audience', '10k');
        await page.fill('#link', 'https://twitter.com/test');
        await page.fill('#strategy', 'Automated Verification Testing');
        await page.check('input[value="paypal"]');
        await page.fill('#paypal_email', `affiliate_${Date.now()}@test.com`);

        await page.screenshot({ path: path.join(PROOF_DIR, '05_affiliate_form_filled.png') });

        // Submit
        log('🚀 Submitting Affiliate Form...');

        const requestPromise = page.waitForRequest(req => req.url().includes('/affiliate/apply') && req.method() === 'POST');

        await page.click('button[type="submit"]');

        try {
            const request = await requestPromise;
            log(`ℹ️ Request URL: ${request.url()}`);

            if (request.url().includes('/api/affiliate/apply')) {
                log('✅ REQUEST URL CORRECT: Contains /api/affiliate/apply');
            } else {
                log('❌ REQUEST URL INCORRECT: Missing /api');
            }
        } catch (e) {
            log('⚠️ Request capture timeout (maybe already sent?)');
        }

        // Wait for redirect to /affiliate/joined
        try {
            await page.waitForURL('**/affiliate/joined', { timeout: 15000 });
            const url = page.url();
            log(`📍 Current URL: ${url}`);

            if (url.includes('/affiliate/joined')) {
                log('✅ SUCCESS: Redirected to /affiliate/joined');
                await page.screenshot({ path: path.join(PROOF_DIR, '09_affiliate_success.png') });
            } else {
                log('❌ FAILURE: Did not redirect to success page.');
                await page.screenshot({ path: path.join(PROOF_DIR, '09_affiliate_fail.png') });
            }
        } catch (e) {
            log('❌ Timeout waiting for redirect (Backend likely returned error)');
            await page.screenshot({ path: path.join(PROOF_DIR, '09_affiliate_error.png') });
        }

    } catch (e) {
        log(`❌ CRITICAL ERROR: ${e.message}`);
        await page.screenshot({ path: path.join(PROOF_DIR, 'critical_error.png') });
    } finally {
        await browser.close();
    }
})();
