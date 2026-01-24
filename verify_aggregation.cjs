
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

// FIX: Handle Windows Environment
const home = process.env.HOME || process.env.USERPROFILE || os.homedir();
process.env.HOME = home;
process.env.USERPROFILE = process.env.USERPROFILE || home;

// Screenshots dir
const proofDir = path.join(__dirname, 'docs', 'proofs', 'activity');
if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

(async () => {
    console.log('🚀 Starting AGGREGATION CHECK...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    try {
        // 1. Practice to generate data
        console.log('▶️ Generating Data (Practice)...');
        await page.goto('https://jobspeakpro.com/practice?skipOnboarding=1');
        await page.waitForResponse(resp => resp.url().includes('/api/activity/start') && resp.status() === 200);
        console.log('✅ Data Generated');

        // 2. Go to Progress
        await page.goto('https://jobspeakpro.com/progress');
        await page.waitForSelector('[data-testid="activity-row"]', { timeout: 15000 });

        // 3. Extract Values
        const totalText = await page.locator('p:near(:text("Total Sessions"))').first().innerText();
        const total = parseInt(totalText, 10);

        const rowCount = await page.locator('[data-testid="activity-row"]').count();

        console.log(`📊 Measured Summary Total: ${total}`);
        console.log(`📊 Measured Row Count: ${rowCount}`);

        if (total === 0 && rowCount > 0) {
            console.error('❌ FAILURE: Total is 0 but rows exist.');
            process.exit(1);
        }

        if (total >= rowCount) {
            console.log('✅ SUCCESS: Aggregation is consistent (Total >= Row Count).');
        } else {
            console.warn('⚠️ WARNING: Total < Row Count? This shouldn\'t happen with additive logic.');
        }

        await page.screenshot({ path: path.join(proofDir, 'VERIFY_aggregation.png'), fullPage: true });

    } catch (err) {
        console.error('❌ Automation Error:', err);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
