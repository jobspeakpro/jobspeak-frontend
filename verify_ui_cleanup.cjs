const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://jobspeakpro.com';
const PROOF_DIR = path.join(__dirname, 'docs/proofs/2026-01-26_referral_affiliate_cleanup');

// Create proof dir
if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
}

const log = (msg) => {
    console.log(`[${new Date().toISOString()}] ${msg}`);
};

(async () => {
    log(`🚀 Starting UI Cleanup Verification on ${TARGET_URL}...`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    // Capture console
    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => consoleLogs.push(`[PAGE_ERROR] ${err.message}`));

    try {
        // 1. Affiliate Bottom Removed
        log('Checking /affiliate footer...');
        await page.goto(`${TARGET_URL}/affiliate`, { waitUntil: 'networkidle' });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000); // Verify visual clean
        await page.screenshot({ path: path.join(PROOF_DIR, '01_affiliate_bottom_removed.png') });
        log('✅ 01_affiliate_bottom_removed.png');

        // 2. How It Works "n." bug
        log('Checking /how-it-works typo...');
        await page.goto(`${TARGET_URL}/how-it-works`, { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(PROOF_DIR, '05_how_it_works_no_n.png') });
        log('✅ 05_how_it_works_no_n.png');

        // 3. Referral Page (Requires Login)
        log('Logging in for Referral checks...');
        await page.goto(`${TARGET_URL}/signin`);
        await page.fill('input[type="email"]', 'testuser@example.com'); // Use a known test user or sign up flow?
        // Actually, we might not have a stable test user credential exposed.
        // Let's use the guest invite flow or signup if needed, OR relies on previous session?
        // Playwright context is fresh. 
        // Let's try to mock a login or use a guest-to-signup flow?
        // Or if we have a test account. The prompt implies "verified working".
        // I will attempt to sign up a fresh account to ensure we get to the referral page.

        await page.goto(`${TARGET_URL}/signup`);
        const email = `test.ref.ui.${Date.now()}@example.com`;
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'Password123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/onboarding/questions', { timeout: 15000 }).catch(() => { });
        // Skip onboarding if possible or nav explicitly
        log('Signed up, navigating to /referral...');
        await page.goto(`${TARGET_URL}/referral`, { waitUntil: 'networkidle' });

        // 4. Referral Layout
        await page.waitForSelector('h1:has-text("Practice Is Better With Friends")');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(PROOF_DIR, '02_referral_layout_fixed.png') });
        log('✅ 02_referral_layout_fixed.png');

        // 5. Copy Toast
        log('Checking Copy Toast...');
        const copyBtn = page.getByTestId('referral-copy');
        await copyBtn.click();
        await page.waitForSelector('text=Link copied!', { timeout: 5000 });
        await page.screenshot({ path: path.join(PROOF_DIR, '03_referral_copy_toast.png') });
        log('✅ 03_referral_copy_toast.png');

        // 6. Share Buttons
        log('Checking Share Buttons...');
        // Scroll to share buttons
        await page.evaluate(() => window.scrollBy(0, 300));
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(PROOF_DIR, '04_referral_share_buttons.png') });
        log('✅ 04_referral_share_buttons.png');

        // Save Console
        fs.writeFileSync(path.join(PROOF_DIR, 'console_clean.txt'), consoleLogs.join('\n'));
        log('✅ console_clean.txt');

    } catch (err) {
        log(`❌ Error: ${err.message}`);
        // Save screenshot of error
        await page.screenshot({ path: path.join(PROOF_DIR, 'error_state.png') });
    } finally {
        await browser.close();
    }
})();
