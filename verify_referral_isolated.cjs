const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://jobspeakpro.com';
const PROOF_DIR = path.join(__dirname, 'docs/proofs/2026-01-24_fix_v4/e2e_success_round2');

const log = (msg) => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] ${msg}`);
};

(async () => {
    log(`🚀 Starting ISOLATED Referral Test on ${TARGET_URL}...`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        const timestamp = Date.now();
        const email = `ref_retry_${timestamp}@example.com`;
        const password = 'RetryPassword123!';

        log(`📋 Attempting Signup with ${email}`);
        await page.goto(`${TARGET_URL}/signup`, { waitUntil: 'load' });
        await page.waitForTimeout(2000);

        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        await page.click('button[type="submit"]');

        log('⏳ Waiting for signup redirect...');
        // Wait longer and look for dashboard/onboarding URL
        await page.waitForURL(url => !url.href.includes('/signup'), { timeout: 30000 });
        log(`✅ Signup Redirected to: ${page.url()}`);

        await page.waitForTimeout(3000); // Allow session to set

        log('📋 Navigating to /referral');
        await page.goto(`${TARGET_URL}/referral`, { waitUntil: 'load' });
        await page.waitForTimeout(3000);

        const referralInput = await page.$('[data-testid="referral-code"]');
        if (referralInput) {
            const val = await referralInput.inputValue();
            log(`✅ Referral Code Visible: ${val}`);
            await page.screenshot({ path: path.join(PROOF_DIR, '03_referral_page_code_visible.png'), fullPage: true });

            const copyBtn = await page.$('[data-testid="referral-copy"]');
            if (copyBtn) {
                await copyBtn.click();
                log('✅ Copy button clicked');
                await page.waitForTimeout(2000);
                await page.screenshot({ path: path.join(PROOF_DIR, '04_referral_copy_toast.png'), fullPage: true });
            }
        } else {
            log('❌ Referral code still not found');
            await page.screenshot({ path: path.join(PROOF_DIR, '03_referral_retry_fail.png'), fullPage: true });
        }

    } catch (e) {
        log(`❌ Error: ${e.message}`);
    } finally {
        await browser.close();
    }
})();
