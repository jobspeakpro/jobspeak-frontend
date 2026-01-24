const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROOF_DIR = path.resolve(__dirname, '../docs/proofs/manual_browser_capture');
if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

// Verified User Credentials
const REFERRER_EMAIL = "razvhjzd@guerrillamailblock.com";
const PASSWORD = "Password123!";

// --- Guerrilla Helper ---
class GuerrillaMail {
    constructor() {
        this.email = null;
        this.sid = null;
    }

    async init() {
        for (let i = 0; i < 3; i++) {
            try {
                const res = await fetch('http://api.guerrillamail.com/ajax.php?f=get_email_address');
                const data = await res.json();
                this.email = data.email_addr;
                this.sid = data.sid_token;
                console.log(`New Guerrilla Mail: ${this.email}`);
                return this.email;
            } catch (e) { await new Promise(r => setTimeout(r, 2000)); }
        }
        throw new Error("Guerrilla Init Failed");
    }

    async waitForLink() {
        console.log(`Polling Guerrilla for ${this.email}...`);
        for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 5000));
            try {
                const res = await fetch(`http://api.guerrillamail.com/ajax.php?f=get_email_list&offset=0&sid_token=${this.sid}`);
                const data = await res.json();
                const list = data.list;

                if (list && list.length > 0) {
                    for (const msg of list) {
                        if (msg.mail_subject.includes('Confirm') || msg.mail_subject.includes('JobSpeak') || msg.mail_from.includes('supabase')) {
                            console.log(`Message found: ${msg.mail_subject}`);
                            const bodyRes = await fetch(`http://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${msg.mail_id}&sid_token=${this.sid}`);
                            const bodyData = await bodyRes.json();
                            const html = bodyData.mail_body;
                            const links = html.match(/href="([^"]+)"/g);
                            if (links) {
                                for (const l of links) {
                                    const url = l.slice(6, -1).replace(/&amp;/g, '&');
                                    if (url.includes('jobspeakpro.com') || url.includes('supabase') || url.includes('verify')) {
                                        console.log('Link found:', url);
                                        return url;
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (e) { }
        }
        throw new Error("Guerrilla Timeout");
    }
}

(async () => {
    console.log("Launching Client-Side Nav Capture...");
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--disable-web-security',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    try {
        // --- 1. LOGIN REFERRER ---
        const context = await browser.newContext();
        await context.tracing.start({ screenshots: true, snapshots: true });
        const page = await context.newPage();

        console.log(`Logging in Verified Referrer: ${REFERRER_EMAIL}`);
        await page.goto('https://jobspeakpro.com/signin');
        await page.fill('#email', REFERRER_EMAIL);
        await page.fill('#password', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');

        console.log("Dashboard loaded. Check session...");
        await page.waitForTimeout(3000);

        // --- 2. CLIENT NAV TO REFERRAL ---
        console.log("Triggering client-side nav to /referral...");
        await page.evaluate(() => {
            window.history.pushState({}, '', '/referral');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });

        console.log("Waiting for input selector...");
        await page.waitForSelector('input[readonly]', { timeout: 30000 });

        // Wait for render
        await page.waitForTimeout(1000);

        await page.screenshot({ path: path.join(PROOF_DIR, '01_referral_code.png'), fullPage: true });
        console.log("Captured 01_referral_code.png");

        const inviteLink = await page.inputValue('input[readonly]');
        const refCode = inviteLink.split('ref/')[1];
        console.log(`Ref Code: ${refCode}`);

        // --- 3. CREATE REFEREE ---
        console.log("\n--- Creating Referee ---");
        const mailReferee = new GuerrillaMail();
        const refereeEmail = await mailReferee.init();

        const contextRef = await browser.newContext();
        const pageRef = await contextRef.newPage();

        await pageRef.goto(`https://jobspeakpro.com/signup?ref=${refCode}`);
        await pageRef.fill('#firstName', 'ManualRefCS');
        await pageRef.fill('#email', refereeEmail);
        await pageRef.fill('#password', PASSWORD);
        await pageRef.click('button[type="submit"]');
        await pageRef.waitForTimeout(5000);

        // Verify Referee
        const verifyLink = await mailReferee.waitForLink();
        const pageVerify = await contextRef.newPage();
        await pageVerify.goto(verifyLink);
        await pageVerify.waitForTimeout(5000);
        await pageVerify.close();

        // Login Referee
        console.log("Logging in Referee...");
        await pageRef.goto('https://jobspeakpro.com/signin');
        await pageRef.fill('#email', refereeEmail);
        await pageRef.fill('#password', PASSWORD);
        await pageRef.click('button[type="submit"]');
        await pageRef.waitForURL('**/dashboard');
        await pageRef.waitForTimeout(3000);

        await pageRef.screenshot({ path: path.join(PROOF_DIR, '02_referee_dashboard.png') });
        console.log("Captured 02_referee_dashboard.png");

        // --- 4. CHECK HISTORY ---
        console.log("\n--- Checking Referrer History ---");
        // CLIENT NAV TO HISTORY
        await page.evaluate(() => {
            window.history.pushState({}, '', '/referral/history');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });

        console.log("Waiting for history table...");
        // Wait for fetch
        await page.waitForTimeout(5000);
        // Maybe trigger a re-fetch since component might not auto-refresh on mount if it was already mounted?
        // No, it mounts on route change.

        await page.screenshot({ path: path.join(PROOF_DIR, '03_referral_history.png'), fullPage: true });
        console.log("Captured 03_referral_history.png");

        console.log("DONE");
    } catch (err) {
        console.error("Client Nav Capture Failed:", err);
        try {
            const pages = await browser.contexts()[0].pages();
            if (pages.length > 0) {
                const p = pages[pages.length - 1];
                console.log(`Final URL: ${p.url()}`);
                await p.screenshot({ path: path.join(PROOF_DIR, 'debug_manual_fail.png'), fullPage: true });
            }
        } catch (e) { }
    } finally {
        await browser.close();
    }
})();
