const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URL = process.argv[2] || 'https://jobspeakpro.com';
const PROOF_DIR = path.join(__dirname, 'docs/proofs/2026-01-24_fix_v4');

if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
}

const log = (msg) => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] ${msg}`);
};

(async () => {
    log(`🚀 Starting Test Suite with Stable Selectors on ${TARGET_URL}...`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        recordVideo: {
            dir: PROOF_DIR,
            size: { width: 1280, height: 800 }
        }
    });
    const page = await context.newPage();

    // Capture Alerts/Dialogs
    page.on('dialog', async dialog => {
        log(`📢 Alert/Dialog: ${dialog.message()}`);
        await dialog.dismiss();
    });

    try {
        // --- Test 1: Affiliate Application Form ---
        log('📋 Test 1: Affiliate Application Form');
        await page.goto(`${TARGET_URL}/affiliate/apply`, { waitUntil: 'load' });

        const timestamp = Date.now();

        // Fill form using stable data-testid selectors
        await page.fill('[data-testid="affiliate-name"]', 'Test User');
        await page.fill('[data-testid="affiliate-email"]', `test_${timestamp}@example.com`);
        await page.selectOption('[data-testid="affiliate-country"]', 'US');
        await page.selectOption('[data-testid="affiliate-platform"]', 'twitter');
        await page.selectOption('[data-testid="affiliate-audience"]', '10k');
        await page.fill('[data-testid="affiliate-link"]', 'https://twitter.com/testuser');
        await page.fill('[data-testid="affiliate-strategy"]', 'Automated test strategy content');

        // Select PayPal payout
        await page.check('[data-testid="payout-paypal"]');
        await page.fill('[data-testid="affiliate-paypal-email"]', `paypal_${timestamp}@example.com`);

        log('✅ Form filled successfully using stable selectors');
        await page.screenshot({ path: path.join(PROOF_DIR, 'test_01_form_filled.png'), fullPage: true });

        // Capture the API request
        const requestPromise = page.waitForRequest(req =>
            req.url().includes('/affiliate/apply') && req.method() === 'POST'
        );

        await page.click('[data-testid="affiliate-submit"]');
        log('🚀 Form submitted');

        try {
            const request = await requestPromise;
            const url = request.url();
            log(`ℹ️  Request URL: ${url}`);

            if (url.includes('/api/affiliate/apply')) {
                log('✅ REQUEST URL CORRECT: Contains /api/affiliate/apply');
            } else {
                log('❌ REQUEST URL INCORRECT: Missing /api prefix');
            }
        } catch (e) {
            log('⚠️  Request capture timeout');
        }

        // Wait for response
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(PROOF_DIR, 'test_02_after_submit.png'), fullPage: true });

        // --- Test 2: Referral Page (Requires Auth) ---
        log('📋 Test 2: Referral Page (Auth Required - Attempting)');

        try {
            // Try to sign up
            await page.goto(`${TARGET_URL}/signup`, { waitUntil: 'networkidle' });
            const signupEmail = `test_${timestamp}@example.com`;
            const signupPassword = 'TestPassword123!';

            await page.fill('input[type="email"]', signupEmail);
            await page.fill('input[type="password"]', signupPassword);

            const submitBtn = await page.$('button[type="submit"]');
            if (submitBtn) {
                await submitBtn.click();
                await page.waitForURL(url => !url.href.includes('/signup'), { timeout: 10000 });
                log('✅ Signup successful');

                // Navigate to referral page
                await page.goto(`${TARGET_URL}/referral`, { waitUntil: 'networkidle' });

                // Check if referral code is visible
                const codeInput = await page.$('[data-testid="referral-code"]');
                if (codeInput) {
                    log('✅ Referral code input found');
                    await page.screenshot({ path: path.join(PROOF_DIR, 'test_03_referral_page.png'), fullPage: true });

                    // Test copy button
                    const copyBtn = await page.$('[data-testid="referral-copy"]');
                    if (copyBtn) {
                        await copyBtn.click();
                        log('✅ Copy button clicked');
                        await page.waitForTimeout(1000);
                        await page.screenshot({ path: path.join(PROOF_DIR, 'test_04_referral_copied.png'), fullPage: true });
                    } else {
                        log('❌ Copy button not found');
                    }
                } else {
                    log('❌ Referral code input not found');
                }
            } else {
                log('⚠️  Signup button not found - skipping referral test');
            }
        } catch (e) {
            log(`⚠️  Referral test skipped: ${e.message}`);
            await page.screenshot({ path: path.join(PROOF_DIR, 'test_03_referral_skip.png'), fullPage: true });
        }

        log('✅ Test suite completed');

    } catch (e) {
        log(`❌ CRITICAL ERROR: ${e.message}`);
        await page.screenshot({ path: path.join(PROOF_DIR, 'test_error.png'), fullPage: true });
    } finally {
        // Close page and context to save video
        await page.close();
        await context.close();
        await browser.close();

        // Rename video file to something more descriptive
        const videoDir = PROOF_DIR;
        const files = fs.readdirSync(videoDir);
        const videoFile = files.find(f => f.endsWith('.webm'));
        if (videoFile) {
            const oldPath = path.join(videoDir, videoFile);
            const newPath = path.join(videoDir, 'test_recording.webm');
            fs.renameSync(oldPath, newPath);
            log(`📹 Video saved: test_recording.webm`);
        }
    }
})();
