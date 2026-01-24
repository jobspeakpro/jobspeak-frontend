const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const baseUrl = 'http://localhost:5173';
    // Ensure proof directory exists
    const proofDir = path.resolve(__dirname, '../docs/proofs/referrals_affiliates');
    if (!fs.existsSync(proofDir)) {
        fs.mkdirSync(proofDir, { recursive: true });
    }

    // Set viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    const routes = [
        { name: 'affiliate_landing', path: '/affiliate' },
        { name: 'affiliate_apply', path: '/affiliate/apply' },
        { name: 'affiliate_joined', path: '/affiliate/joined' },
        { name: 'referral_page', path: '/referral' },
        { name: 'referral_history', path: '/referral/history' }
    ];

    try {
        for (const route of routes) {
            console.log(`Navigating to ${route.path}...`);
            await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
            // Small delay for rendering
            await page.waitForTimeout(1000);
            const screenshotPath = path.join(proofDir, `${route.name}.png`);
            await page.screenshot({ path: screenshotPath });
            console.log(`Saved ${screenshotPath}`);
        }

        // Modal Test
        console.log('Testing Modal...');
        await page.goto(`${baseUrl}/referral/history`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        console.log('Clicking Use Credit Now...');
        // Locate button by text
        const button = await page.getByText('Use Credit Now');
        if (await button.count() > 0) {
            await button.click();
            await page.waitForTimeout(1000); // Animation
            await page.screenshot({ path: path.join(proofDir, 'redeem_modal.png') });
            console.log('Saved redeem_modal.png');
        } else {
            console.log('Button not found!');
        }

    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
