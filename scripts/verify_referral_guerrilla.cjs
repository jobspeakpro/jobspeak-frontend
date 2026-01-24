const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROOF_DIR = path.resolve(__dirname, '../docs/proofs/referral_final_guerrilla');
if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

// --- Guerrilla Helper Class ---
class GuerrillaMail {
    constructor() {
        this.email = null;
        this.sid = null;
    }

    async init() {
        // Retry logic for getting email
        for (let i = 0; i < 3; i++) {
            try {
                const res = await fetch('http://api.guerrillamail.com/ajax.php?f=get_email_address');
                const data = await res.json();
                this.email = data.email_addr;
                this.sid = data.sid_token;
                console.log(`Guerrilla Account: ${this.email}`);
                return this.email;
            } catch (e) { console.log("Retrying init..."); await new Promise(r => setTimeout(r, 2000)); }
        }
        throw new Error("Guerrilla Init Failed");
    }

    async waitForLink() {
        console.log(`Polling Guerrilla for ${this.email}...`);
        for (let i = 0; i < 24; i++) {
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
            } catch (e) { console.log("Poll error, retrying..."); }
        }
        throw new Error("Guerrilla Timeout");
    }
}

(async () => {
    console.log("Launching Guerrilla Verification (Diagnostic)...");
    const browser = await chromium.launch({ headless: true });

    try {
        const mailReferrer = new GuerrillaMail();
        const emailRef = await mailReferrer.init();

        const contextRef = await browser.newContext();
        await contextRef.tracing.start({ screenshots: true, snapshots: true });
        const pageRef = await contextRef.newPage();

        console.log(`REFERRER Signup: ${emailRef}`);
        await pageRef.goto('https://jobspeakpro.com/signup');
        await pageRef.fill('#firstName', 'ReferrerGue');
        await pageRef.fill('#email', emailRef);
        await pageRef.fill('#password', 'Password123!');
        await pageRef.click('button[type="submit"]');

        await pageRef.waitForTimeout(5000);

        const linkRef = await mailReferrer.waitForLink();
        const pageVerify = await contextRef.newPage();
        await pageVerify.goto(linkRef);
        await pageVerify.waitForTimeout(5000);
        await pageVerify.close();

        console.log("Logging in Referrer...");
        await pageRef.goto('https://jobspeakpro.com/signin');
        await pageRef.fill('#email', emailRef);
        await pageRef.fill('#password', 'Password123!');
        await pageRef.click('button[type="submit"]');
        await pageRef.waitForURL('**/dashboard');

        // --- DIAGNOSTICS ---
        console.log("Waiting 15s for session stabilization...");
        await pageRef.waitForTimeout(15000);

        console.log("Checking /practice (Protected)...");
        await pageRef.goto('https://jobspeakpro.com/practice');
        await pageRef.waitForTimeout(5000);
        console.log(`URL after /practice: ${pageRef.url()}`);

        console.log("Navigating to /referral...");
        await pageRef.goto('https://jobspeakpro.com/referral');
        await pageRef.waitForSelector('input[readonly]', { timeout: 60000 });

        await pageRef.screenshot({ path: path.join(PROOF_DIR, '1_referrer_with_code.png'), fullPage: true });
        console.log("Saved 1_referrer_with_code.png");

        const inviteLink = await pageRef.inputValue('input[readonly]');
        const refCode = inviteLink.split('ref/')[1];
        console.log(`CODE: ${refCode}`);

        // Referee Loop...
        // Simplified for now, let's just get the code first.

    } catch (err) {
        console.error("Guerrilla Verification Failed:", err);
        try {
            const pages = await browser.contexts()[0].pages();
            if (pages.length > 0) {
                const p = pages[pages.length - 1];
                console.log(`Final URL: ${p.url()}`);
                await p.screenshot({ path: path.join(PROOF_DIR, 'debug_guerrilla_fail.png'), fullPage: true });
                console.log("Saved debug_guerrilla_fail.png");
            }
        } catch (e) { console.error("Screenshot failed", e); }
    } finally {
        await browser.close();
    }
})();
