const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROOF_DIR = path.resolve(__dirname, '../docs/proofs/referral_final_real');
if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

// --- MailTM Helper Class ---
class MailTm {
    constructor() {
        this.token = null;
        this.email = null;
        this.password = "Password123!";
    }

    async init() {
        // Get Domain
        const res = await fetch('https://api.mail.tm/domains');
        const data = await res.json();
        const domain = data['hydra:member'][0].domain;
        this.email = `jobspeak_${Date.now()}_${Math.floor(Math.random() * 1000)}@${domain}`;

        // Create Account
        const accRes = await fetch('https://api.mail.tm/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: this.email, password: this.password })
        });
        if (!accRes.ok) throw new Error("MailTM create failed");

        // Get Token
        const tokenRes = await fetch('https://api.mail.tm/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: this.email, password: this.password })
        });
        const tokenData = await tokenRes.json();
        this.token = tokenData.token;
        console.log(`MailTM Account: ${this.email}`);
        return this.email;
    }

    async waitForLink() {
        console.log(`Polling MailTM for ${this.email}...`);
        for (let i = 0; i < 30; i++) { // 90s roughly
            await new Promise(r => setTimeout(r, 3000));
            const res = await fetch('https://api.mail.tm/messages', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await res.json();
            const msgs = data['hydra:member'];

            if (msgs && msgs.length > 0) {
                console.log("Message received!");
                const msgId = msgs[0]['id'];
                // Get Source
                const msgRes = await fetch(`https://api.mail.tm/messages/${msgId}`, {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                const msgData = await msgRes.json();
                const html = msgData.html ? msgData.html[0] : (msgData.text || "");

                // Find Link
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
        throw new Error("MailTM Timeout");
    }
}

(async () => {
    console.log("Launching MailTM Verification...");
    const browser = await chromium.launch({ headless: true });

    try {
        // -----------------------
        // 1. REFERRER SETUP
        // -----------------------
        const mailReferrer = new MailTm();
        const emailRef = await mailReferrer.init();

        const contextRef = await browser.newContext();
        const pageRef = await contextRef.newPage();

        console.log(`REFERRER Signup: ${emailRef}`);
        await pageRef.goto('https://jobspeakpro.com/signup');
        await pageRef.fill('#firstName', 'ReferrerReal');
        await pageRef.fill('#email', emailRef);
        await pageRef.fill('#password', 'Password123!');
        await pageRef.click('button[type="submit"]'); // "Create Account"
        await pageRef.waitForTimeout(3000);

        // Verify
        const linkRef = await mailReferrer.waitForLink();
        const pageVerify = await contextRef.newPage();
        await pageVerify.goto(linkRef);
        await pageVerify.waitForTimeout(5000); // Wait for verify
        await pageVerify.close();

        // Login
        console.log("Logging in Referrer...");
        await pageRef.goto('https://jobspeakpro.com/signin');
        await pageRef.fill('#email', emailRef);
        await pageRef.fill('#password', 'Password123!');
        await pageRef.click('button[type="submit"]');
        await pageRef.waitForURL('**/dashboard');

        // Get Code
        await pageRef.goto('https://jobspeakpro.com/referral');
        await pageRef.waitForSelector('input[readonly]');

        await pageRef.screenshot({ path: path.join(PROOF_DIR, '1_referrer_with_code.png'), fullPage: true });
        console.log("Saved 1_referrer_with_code.png");

        const inviteLink = await pageRef.inputValue('input[readonly]');
        const refCode = inviteLink.split('ref/')[1];
        console.log(`CODE: ${refCode}`);

        // -----------------------
        // 2. REFEREE SETUP
        // -----------------------
        const mailReferee = new MailTm();
        const emailUser = await mailReferee.init();

        const contextUser = await browser.newContext();
        const pageUser = await contextUser.newPage();

        console.log(`REFEREE Signup: ${emailUser}`);
        await pageUser.goto(`https://jobspeakpro.com/signup?ref=${refCode}`);

        await pageUser.fill('#firstName', 'RefereeReal');
        await pageUser.fill('#email', emailUser);
        await pageUser.fill('#password', 'Password123!');
        await pageUser.click('button[type="submit"]');
        await pageUser.waitForTimeout(3000);

        // Verify
        const linkUser = await mailReferee.waitForLink();
        const pageVerifyUser = await contextUser.newPage();
        await pageVerifyUser.goto(linkUser);
        await pageVerifyUser.waitForTimeout(5000);
        await pageVerifyUser.close();

        // Login Referee
        console.log("Logging in Referee...");
        await pageUser.goto('https://jobspeakpro.com/signin');
        await pageUser.fill('#email', emailUser);
        await pageUser.fill('#password', 'Password123!');
        await pageUser.click('button[type="submit"]');
        await pageUser.waitForURL('**/dashboard');

        await pageUser.screenshot({ path: path.join(PROOF_DIR, '2_referee_logged_in.png') });
        console.log("Saved 2_referee_logged_in.png");

        // -----------------------
        // 3. HISTORY CHECK
        // -----------------------
        console.log("Checking History...");
        await pageRef.goto('https://jobspeakpro.com/referral/history');
        // Wait for fetch
        await pageRef.waitForTimeout(5000);
        await pageRef.reload();
        await pageRef.waitForTimeout(5000);

        await pageRef.screenshot({ path: path.join(PROOF_DIR, '3_referrer_history.png'), fullPage: true });
        console.log("Saved 3_referrer_history.png");

        console.log("DONE");

    } catch (err) {
        console.error("MailTM Verification Failed:", err);
    } finally {
        await browser.close();
    }
})();
