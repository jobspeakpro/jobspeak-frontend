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
    console.log("Launching Manual Capture Loop (Stealth)...");
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    try {
        // --- 1. LOGIN REFERRER ---
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });
        await context.tracing.start({ screenshots: true, snapshots: true });
        const page = await context.newPage();

        console.log(`Logging in Verified Referrer: ${REFERRER_EMAIL}`);
        await page.goto('https://jobspeakpro.com/signin');
        await page.fill('#email', REFERRER_EMAIL);
        await page.fill('#password', PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');

        console.log("Dashboard loaded. Checking Token...");
        const token = await page.evaluate(() => {
            return Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
        });
        console.log(`Token Key Found: ${token}`);

        console.log("Waiting for stabilization...");
        await page.waitForTimeout(5000);

        // --- 2. CAPTURE CODE ---
        console.log("Navigating to /referral...");
        await page.goto('https://jobspeakpro.com/referral');

        // Use a more generic selector first to see if page loads at all
        await page.waitForLoadState('domcontentloaded');

        // Try waiting for input
        console.log("Waiting for input selector...");
        await page.waitForSelector('input[readonly]', { timeout: 30000 });

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
        await contextRef.addInitScript(() => {
            // mock permissions?
        });
        const pageRef = await contextRef.newPage();

        await pageRef.goto(`https://jobspeakpro.com/signup?ref=${refCode}`);
        await pageRef.fill('#firstName', 'ManualReferee');
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
        // Reuse original page/context
        await page.goto('https://jobspeakpro.com/referral/history');
        await page.waitForTimeout(5000); // Wait for fetch
        await page.reload();
        await page.waitForTimeout(5000);

        await page.screenshot({ path: path.join(PROOF_DIR, '03_referral_history.png'), fullPage: true });
        console.log("Captured 03_referral_history.png");

        console.log("DONE");

    } catch (err) {
        console.error("Manual Capture Failed:", err);
        try {
            const pages = await browser.contexts()[0].pages();
            if (pages.length > 0) {
                const p = pages[pages.length - 1];
                console.log(`Final URL: ${p.url()}`);
                await p.screenshot({ path: path.join(PROOF_DIR, 'debug_manual_fail.png'), fullPage: true });
                const html = await p.content();
                fs.writeFileSync(path.join(PROOF_DIR, 'debug_manual_fail.html'), html);
                console.log("Saved debug diagnostics.");
            }
        } catch (e) { console.error("Diagnostic failed", e); }
    } finally {
        await browser.close();
    }
})();
