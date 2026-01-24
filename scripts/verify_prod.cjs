const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('Launching browser for PROD verification...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const baseUrl = 'https://jobspeakpro.com';
    const proofDir = path.resolve(__dirname, '../docs/proofs/prod_routes');
    if (!fs.existsSync(proofDir)) {
        fs.mkdirSync(proofDir, { recursive: true });
    }

    await page.setViewportSize({ width: 1280, height: 800 });

    try {
        // 1. Affiliate Landing (Public)
        console.log(`Checking ${baseUrl}/affiliate ...`);
        const resp1 = await page.goto(`${baseUrl}/affiliate`, { waitUntil: 'networkidle' });
        console.log(`Status: ${resp1.status()}`);
        await page.screenshot({ path: path.join(proofDir, 'prod_affiliate.png') });

        // 2. Affiliate Apply (Public)
        console.log(`Checking ${baseUrl}/affiliate/apply ...`);
        await page.goto(`${baseUrl}/affiliate/apply`, { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(proofDir, 'prod_affiliate_apply.png') });

        // 3. Referral (Protected -> should redirect to signin)
        console.log(`Checking ${baseUrl}/referral (Expect Redirect)...`);
        await page.goto(`${baseUrl}/referral`);
        await page.waitForTimeout(2000);
        console.log(`Current URL: ${page.url()}`);
        await page.screenshot({ path: path.join(proofDir, 'prod_referral_redirect.png') });

        // 4. Referral History (Protected -> should redirect)
        console.log(`Checking ${baseUrl}/referral/history (Expect Redirect)...`);
        await page.goto(`${baseUrl}/referral/history`);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(proofDir, 'prod_referral_history_redirect.png') });

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await browser.close();
    }
})();
