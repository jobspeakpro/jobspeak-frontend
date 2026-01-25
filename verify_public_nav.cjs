const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Handle Windows Environment
const home = process.env.HOME || process.env.USERPROFILE || os.homedir();
process.env.HOME = home;
process.env.USERPROFILE = process.env.USERPROFILE || home;

const proofDir = path.join(__dirname, 'docs', 'proofs', 'public_nav_affiliate_v1');
if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

const BASE_URL = process.argv[2] || 'http://localhost:5173';

(async () => {
    console.log(`🚀 Starting Public Nav Verification on ${BASE_URL}...`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    try {
        // 1. Home Page (Logged Out)
        console.log('📸 Checking Home Page...');
        await page.goto(`${BASE_URL}/`);
        await page.waitForTimeout(2000);

        // Screenshot 1: Top-right nav includes Affiliate
        console.log('📸 Capturing 01_home_logged_out_nav.png');
        await page.screenshot({ path: path.join(proofDir, '01_home_logged_out_nav.png'), clip: { x: 0, y: 0, width: 1280, height: 100 } });

        // Screenshot 2: Bottom Affiliate CTA
        console.log('📸 Capturing 02_home_affiliate_cta_bottom.png');

        // Try multiple locators
        const heading = page.getByRole('heading', { name: 'Become an Affiliate Partner' });

        if (await heading.count() > 0) {
            await heading.first().scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: path.join(proofDir, '02_home_affiliate_cta_bottom.png') });
        } else {
            console.error('❌ Affiliate section not found! Taking full page debug screenshot.');
            await page.screenshot({ path: path.join(proofDir, 'DEBUG_home_full.png'), fullPage: true });

            // Fallback: check page source
            const content = await page.content();
            if (content.includes("Become an Affiliate Partner")) {
                console.log("⚠️ Text found in source but not visible/interactive.");
            } else {
                console.log("❌ Text NOT found in source.");
            }
        }

        // 2. Support Page
        console.log('📸 Checking Support Page...');
        await page.goto(`${BASE_URL}/support`);
        await page.waitForTimeout(2000);

        // Screenshot 3: Header match
        console.log('📸 Capturing 03_support_header_match.png');
        await page.screenshot({ path: path.join(proofDir, '03_support_header_match.png'), clip: { x: 0, y: 0, width: 1280, height: 150 } });

        console.log('✅ Verification Complete.');

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await browser.close();
    }
})();
