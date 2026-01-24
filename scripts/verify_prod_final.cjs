const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROOF_DIR = path.resolve(__dirname, '../docs/proofs/referral_final');
if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

async function getEmail(prefix) {
    const random = Math.floor(Math.random() * 100000);
    return `${prefix}_${random}@mailinator.com`;
}

async function verifyEmailMailinator(context, email) {
    const page = await context.newPage();
    try {
        const login = email.split('@')[0];
        console.log(`Checking Mailinator for ${login}...`);

        // Go to public inbox
        await page.goto(`https://www.mailinator.com/v4/public/inbox.jsp?to=${login}`, { waitUntil: 'domcontentloaded' });

        for (let i = 0; i < 30; i++) { // Poll
            // Wait for network idle or just check selector
            // Mailinator displays rows.
            // We can check text on page basically.

            // Wait for Angular/JS to load table
            try {
                await page.waitForSelector('tr[ng-repeat="email in emails"]', { timeout: 5000 });
            } catch (e) { }

            const rows = await page.locator('tr[ng-repeat="email in emails"]').count();
            if (rows > 0) {
                console.log("Mail found!");
                await page.locator('tr[ng-repeat="email in emails"]').first().click();
                await page.waitForTimeout(2000);

                const frame = page.frameLocator('#html_msg_body');

                try {
                    await frame.locator('body').waitFor({ timeout: 5000 });
                } catch (e) { }

                const html = await frame.locator('body').innerHTML();
                const links = html.match(/href="([^"]+)"/g);
                if (links) {
                    for (const l of links) {
                        const url = l.slice(6, -1).replace(/&amp;/g, '&');
                        if (url.includes('jobspeakpro.com') || url.includes('supabase') || url.includes('verify')) {
                            console.log('Link found:', url);
                            await page.close();
                            return url;
                        }
                    }
                }
            }
            await page.reload();
            await page.waitForTimeout(4000);
        }
    } catch (e) {
        await page.screenshot({ path: path.join(PROOF_DIR, `debug_mailinator_fail_${email}.png`) });
        console.error("Mailinator error:", e);
    }
    await page.close();
    throw new Error(`Email validation timed out for ${email}`);
}

(async () => {
    console.log("Launching Final Verification (Mailinator)...");
    const browser = await chromium.launch({ headless: true });

    try {
        // -----------------------
        // 1. REFERRER SETUP
        // -----------------------
        const contextRef = await browser.newContext();
        await contextRef.tracing.start({ screenshots: true, snapshots: true });

        const pageRef = await contextRef.newPage();

        const emailRef = await getEmail('jobspeak_ref');
        const pass = 'Password123!';
        console.log(`REFERRER: ${emailRef}`);

        // Signup
        await pageRef.goto('https://jobspeakpro.com/signup');
        await pageRef.fill('#firstName', 'ReferrerFinal');
        await pageRef.fill('#email', emailRef);
        await pageRef.fill('#password', pass);
        await pageRef.click('button[type="submit"]');

        await pageRef.waitForTimeout(5000); // Wait for submission

        // Verify
        const linkRef = await verifyEmailMailinator(contextRef, emailRef);

        // Visit Verification Link
        const pageVerify = await contextRef.newPage();
        await pageVerify.goto(linkRef);
        await pageVerify.waitForTimeout(5000);
        await pageVerify.close();

        // Login Referrer
        await pageRef.goto('https://jobspeakpro.com/signin');
        await pageRef.fill('#email', emailRef);
        await pageRef.fill('#password', pass);
        await pageRef.click('button[type="submit"]');
        await pageRef.waitForURL('**/dashboard');
        console.log("Referrer Logged In");

        // Get Code
        await pageRef.goto('https://jobspeakpro.com/referral');
        await pageRef.waitForSelector('input[readonly]');

        await pageRef.screenshot({ path: path.join(PROOF_DIR, '1_referrer_with_code.png'), fullPage: true });
        console.log("Captured 1_referrer_with_code.png");

        const val = await pageRef.inputValue('input[readonly]');
        const refCode = val.split('ref/')[1];
        console.log("CODE:", refCode);

        // -----------------------
        // 2. REFEREE SETUP (Incognito)
        // -----------------------
        const contextUser = await browser.newContext(); // Fresh context
        const pageUser = await contextUser.newPage();

        const emailUser = await getEmail('jobspeak_user');
        console.log(`REFEREE: ${emailUser}`);

        await pageUser.goto(`https://jobspeakpro.com/signup?ref=${refCode}`);

        await pageUser.fill('#firstName', 'RefereeFinal');
        await pageUser.fill('#email', emailUser);
        await pageUser.fill('#password', pass);
        await pageUser.click('button[type="submit"]');

        await pageUser.waitForTimeout(5000);

        // Verify Referee
        const linkUser = await verifyEmailMailinator(contextUser, emailUser);

        // Visit Verification
        const pageVerifyUser = await contextUser.newPage();
        await pageVerifyUser.goto(linkUser);
        await pageVerifyUser.waitForTimeout(5000);
        await pageVerifyUser.close();

        // Login Referee
        await pageUser.goto('https://jobspeakpro.com/signin');
        await pageUser.fill('#email', emailUser);
        await pageUser.fill('#password', pass);
        await pageUser.click('button[type="submit"]');
        await pageUser.waitForURL('**/dashboard');

        await pageUser.screenshot({ path: path.join(PROOF_DIR, '2_referee_logged_in.png') });
        console.log("Captured 2_referee_logged_in.png");

        // -----------------------
        // 3. REFERRER HISTORY
        // -----------------------
        console.log("Checking History...");
        await pageRef.goto('https://jobspeakpro.com/referral/history');
        await pageRef.waitForTimeout(5000);
        await pageRef.reload();
        await pageRef.waitForTimeout(5000);

        await pageRef.screenshot({ path: path.join(PROOF_DIR, '3_referrer_history.png'), fullPage: true });
        console.log("Captured 3_referrer_history.png");

        console.log("DONE");
    } catch (err) {
        console.error("FINAL VERIFICATION FAILED:", err);
    } finally {
        await browser.close();
    }
})();
