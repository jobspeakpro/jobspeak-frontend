const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROOF_DIR = path.resolve(__dirname, '../docs/proofs/referral_e2e_bypass');
if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

async function getTempEmailString() {
    const random = Math.floor(Math.random() * 100000);
    return `jobspeak_bypass_${random}@yopmail.com`;
}

(async () => {
    console.log("Launching browser (Bypass Mode v3)...");
    const browser = await chromium.launch({ headless: true });
    let refPage;

    try {
        // --- STEP 1: CREATE REFERRER ---
        const context1 = await browser.newContext();
        refPage = await context1.newPage();

        console.log('\n--- Referrer Setup ---');
        const referrerEmail = await getTempEmailString();
        console.log(`Referrer: ${referrerEmail}`);

        await refPage.goto('https://jobspeakpro.com/signup');
        await refPage.fill('#firstName', 'ReferrerBypass');
        await refPage.fill('#email', referrerEmail);
        await refPage.fill('#password', 'Password123!');
        await refPage.click('button[type="submit"]');

        console.log("Waiting for auto-login (1s delay in code)...");
        await refPage.waitForURL('**/dashboard', { timeout: 60000 });
        console.log("Referrer Logged In!");

        console.log('Visiting /referral...');
        await refPage.goto('https://jobspeakpro.com/referral');
        await refPage.waitForSelector('input[readonly]');

        // SCREENSHOT 1
        console.log('Capturing Screenshot 1...');
        await refPage.screenshot({ path: path.join(PROOF_DIR, '1_referrer_code.png'), fullPage: true });

        const inviteLink = await refPage.inputValue('input[readonly]');
        const referralCode = inviteLink.split('ref/')[1];
        console.log(`Referral Code: ${referralCode}`);

        // --- STEP 2: CREATE REFERRED ---
        const context2 = await browser.newContext();
        const userPage = await context2.newPage();

        console.log('\n--- Referred Setup ---');
        const referredEmail = await getTempEmailString();
        console.log(`Referred: ${referredEmail}`);

        const refLinkUrl = `https://jobspeakpro.com/signup?ref=${referralCode}`;
        await userPage.goto(refLinkUrl);
        await userPage.fill('#firstName', 'ReferredBypass');
        await userPage.fill('#email', referredEmail);
        await userPage.fill('#password', 'Password123!');
        await userPage.click('button[type="submit"]');

        console.log("Waiting for auto-login (Referred)...");
        await userPage.waitForURL('**/dashboard', { timeout: 60000 });
        console.log("Referred User Logged In!");

        // SCREENSHOT 2 (Signup success)
        console.log('Capturing Screenshot 2...');
        await userPage.screenshot({ path: path.join(PROOF_DIR, '2_referred_dashboard.png') });

        // --- STEP 3: VERIFY HISTORY (Referrer) ---
        console.log('\n--- Verifying History ---');
        // Referrer is still logged in context1
        await refPage.goto('https://jobspeakpro.com/referral/history');
        await refPage.reload();
        await refPage.waitForTimeout(4000);

        // SCREENSHOT 3
        console.log('Capturing Screenshot 3...');
        await refPage.screenshot({ path: path.join(PROOF_DIR, '3_referral_history.png'), fullPage: true });

        console.log("DONE");
    } catch (err) {
        console.error('Bypass Verification Failed:', err);
        if (refPage) {
            console.log('Final URL:', refPage.url());
            await refPage.screenshot({ path: path.join(PROOF_DIR, 'debug_bypass_fail.png'), fullPage: true });
            console.log('Saved debug_bypass_fail.png');
        }
    } finally {
        await browser.close();
    }
})();
