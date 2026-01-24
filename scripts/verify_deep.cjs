const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('Launching browser for DEEP prod verification...');
    const browser = await chromium.launch({ headless: true });
    // Increase timeout for network checks
    const context = await browser.newContext();
    const page = await context.newPage();
    const baseUrl = 'https://jobspeakpro.com';

    // Capture console and network
    page.on('console', msg => console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
    page.on('response', resp => {
        if (resp.status() >= 400) {
            console.log(`[NETWORK ERROR] ${resp.status()} ${resp.url()}`);
        }
    });

    const proofDir = path.resolve(__dirname, '../docs/proofs/prod_debug');
    if (!fs.existsSync(proofDir)) {
        fs.mkdirSync(proofDir, { recursive: true });
    }

    try {
        // 1. Visit /affiliate
        console.log(`\n--- Visiting ${baseUrl}/affiliate ---`);
        const resp = await page.goto(`${baseUrl}/affiliate`, { waitUntil: 'networkidle' });
        console.log(`Final URL: ${page.url()}`);
        console.log(`Status: ${resp.status()}`);

        // Check router type by injecting JS
        const routerType = await page.evaluate(() => {
            // Check if hash exists in URL or if history API is used
            const isHash = window.location.hash.length > 0;
            // Check for __BUILD_ID__ global if present
            const buildId = window.__BUILD_ID__;
            return { isHash, buildId };
        });
        console.log(`Router check: ${JSON.stringify(routerType)}`);

        await page.screenshot({ path: path.join(proofDir, 'debug_affiliate.png') });

        // 2. Visit /referral (check redirect)
        console.log(`\n--- Visiting ${baseUrl}/referral ---`);
        await page.goto(`${baseUrl}/referral`, { waitUntil: 'commit' });
        // Wait for potential redirect
        await page.waitForTimeout(2000);
        console.log(`Final URL: ${page.url()}`);
        await page.screenshot({ path: path.join(proofDir, 'debug_referral.png') });

    } catch (err) {
        console.error('Deep verification failed:', err);
    } finally {
        await browser.close();
    }
})();
