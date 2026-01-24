const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROOF_DIR = path.resolve(__dirname, '../docs/proofs/referral_e2e_bypass');
if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

async function getTempEmailString() {
    const random = Math.floor(Math.random() * 100000);
    return `jobspeak_bypass_debug_${random}@example.com`;
}

(async () => {
    console.log("Launching browser (Debug Bypass Mode)...");
    const browser = await chromium.launch({ headless: true });

    try {
        const context1 = await browser.newContext();
        await context1.tracing.start({ screenshots: true, snapshots: true });

        const page = await context1.newPage();

        // Console logs
        page.on('console', msg => console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
        page.on('pageerror', err => console.log(`[PAGE ERROR] ${err}`));

        console.log('Visiting Signup...');
        await page.goto('https://jobspeakpro.com/signup');

        const email = await getTempEmailString();
        console.log(`Using email: ${email}`);

        await page.fill('#firstName', 'DebugUser');
        await page.fill('#email', email);
        await page.fill('#password', 'Password123!');

        console.log('Submitting form...');
        await page.click('button[type="submit"]');

        console.log('Waiting 10s for reaction...');
        await page.waitForTimeout(10000);

        await page.screenshot({ path: path.join(PROOF_DIR, 'debug_after_submit.png'), fullPage: true });
        console.log('Captured debug_after_submit.png');

        console.log('Current URL:', page.url());

        // Check local storage for session
        const session = await page.evaluate(() => localStorage.getItem('sb-access-token') || localStorage.getItem('supabase.auth.token'));
        console.log('Session present:', !!session);

    } catch (err) {
        console.error('Debug Failed:', err);
    } finally {
        await browser.close();
    }
})();
