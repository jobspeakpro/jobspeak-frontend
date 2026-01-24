const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROOF_DIR = path.resolve(__dirname, '../docs/proofs/referral_final_inject');
if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

(async () => {
    console.log("Launching Injection Verification...");
    const browser = await chromium.launch({ headless: true });

    try {
        const authPath = path.resolve(__dirname, '../docs/proofs/referral_final_persist/auth.json');
        if (!fs.existsSync(authPath)) {
            throw new Error("Auth.json not found! Run persist script first.");
        }

        const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
        const originData = authData.origins.find(o => o.origin === 'https://jobspeakpro.com');
        if (!originData) throw new Error("No origin data for jobspeakpro.com");

        const tokenEntry = originData.localStorage.find(e => e.name.startsWith('sb-') && e.name.endsWith('-auth-token'));
        if (!tokenEntry) throw new Error("No supabase token found in auth.json");

        console.log(`Found Token Key: ${tokenEntry.name}`);

        const context = await browser.newContext();
        await context.tracing.start({ screenshots: true, snapshots: true });
        const page = await context.newPage();

        // Go to site first to set localstorage scope
        await page.goto('https://jobspeakpro.com/signin');

        // INJECT
        console.log("Injecting token to localStorage...");
        await page.evaluate(({ key, value }) => {
            localStorage.setItem(key, value);
        }, { key: tokenEntry.name, value: tokenEntry.value });

        // Reload to pick up session
        console.log("Reloading to activate session...");
        await page.goto('https://jobspeakpro.com/dashboard');
        await page.waitForTimeout(3000);

        console.log(`URL after dashboard: ${page.url()}`);

        // Go to Referral
        console.log("Navigating to Referral...");
        await page.goto('https://jobspeakpro.com/referral');
        await page.waitForSelector('input[readonly]', { timeout: 30000 });

        await page.screenshot({ path: path.join(PROOF_DIR, '1_referrer_with_code.png'), fullPage: true });
        console.log("SUCCESS: Saved 1_referrer_with_code.png");

        const inviteLink = await page.inputValue('input[readonly]');
        const refCode = inviteLink.split('ref/')[1];
        console.log(`CODE: ${refCode}`);

    } catch (err) {
        console.error("Injection Failed:", err);
        try {
            const pages = await browser.contexts()[0].pages();
            if (pages.length > 0) {
                const p = pages[pages.length - 1];
                console.log(`Final URL: ${p.url()}`);
                await p.screenshot({ path: path.join(PROOF_DIR, 'debug_inject_fail.png'), fullPage: true });
            }
        } catch (e) { }
    } finally {
        await browser.close();
    }
})();
