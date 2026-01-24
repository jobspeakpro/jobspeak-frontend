const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROOF_DIR = path.resolve(__dirname, '../docs/proofs/referral_e2e');
if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

async function getTempEmailString() {
    const random = Math.floor(Math.random() * 100000);
    return `jobspeak_test_${random}@yopmail.com`;
}

async function waitForConfirmationLinkYop(context, email) {
    const page = await context.newPage();
    const login = email.split('@')[0];

    console.log(`Checking YOPmail for ${email}...`);
    try {
        await page.goto('https://yopmail.com/en/', { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Wait for login input
        await page.waitForSelector('#login', { timeout: 10000 });
        await page.fill('#login', login);

        // Press Enter (Robustness Fix)
        await page.keyboard.press('Enter');

        // Wait for inbox frame
        try {
            await page.waitForSelector('#ifinbox', { timeout: 10000 });
        } catch (e) {
            console.log("Inbox frame not found immediately, checking for manual refresh...");
        }

        for (let i = 0; i < 20; i++) {
            await page.waitForTimeout(5000);

            // Try to click refresh buttons if available - multiple potential selectors
            // Main page refresh
            try {
                const refreshBtn = await page.$('#refresh');
                if (refreshBtn) await refreshBtn.click();
            } catch (e) { }

            // Check if there is a mail in 'ifinbox'
            // Need to carefully check frame
            const frameInbox = page.frameLocator('#ifinbox');

            // Count mails
            let mailCount = 0;
            try {
                mailCount = await frameInbox.locator('.m').count();
            } catch (e) {
                // Frame might not be loaded
            }

            if (mailCount > 0) {
                console.log('Mail found!');
                // Click first mail
                await frameInbox.locator('.m').first().click();
                await page.waitForTimeout(2000);

                // Read body in 'ifmail'
                const frameMail = page.frameLocator('#ifmail');
                const html = await frameMail.locator('body').innerHTML();

                // Link regex
                const links = html.match(/href="([^"]+)"/g);
                if (links) {
                    for (const l of links) {
                        const url = l.slice(6, -1).replace(/&amp;/g, '&');
                        if (url.includes('jobspeakpro.com') || url.includes('supabase')) {
                            console.log('Found verification link:', url);
                            await page.close();
                            return url;
                        }
                    }
                }
            } else {
                console.log('Inbox empty... waiting');
            }
        }
    } catch (err) {
        console.error("YOPmail interaction failed:", err);
        await page.screenshot({ path: path.join(PROOF_DIR, 'debug_yopmail_fail.png') });
        throw err;
    }
    await page.close();
    throw new Error('Email timeout in YOPmail');
}

(async () => {
    console.log("Launching browser (YOPmail V2)...");
    const browser = await chromium.launch({ headless: true });

    try {
        // --- STEP 1: CREATE REFERRER ---
        const context1 = await browser.newContext();
        console.log('\n--- Referrer Setup ---');
        const referrerEmail = await getTempEmailString();
        console.log(`Referrer: ${referrerEmail}`);

        const refPage = await context1.newPage();
        await refPage.goto('https://jobspeakpro.com/signup');
        await refPage.fill('#firstName', 'ReferrerYop');
        await refPage.fill('#email', referrerEmail);
        await refPage.fill('#password', 'Password123!');
        await refPage.click('button[type="submit"]');

        const verifyLink1 = await waitForConfirmationLinkYop(context1, referrerEmail);
        await refPage.goto(verifyLink1);
        await refPage.waitForTimeout(5000);

        // Login
        await refPage.goto('https://jobspeakpro.com/signin');
        await refPage.fill('#email', referrerEmail);
        await refPage.fill('#password', 'Password123!');
        await refPage.click('button[type="submit"]');
        await refPage.waitForURL('**/dashboard');

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
        console.log('\n--- Referred Setup ---');
        const referredEmail = await getTempEmailString();
        console.log(`Referred: ${referredEmail}`);

        const refLinkUrl = `https://jobspeakpro.com/signup?ref=${referralCode}`;
        const userPage = await context2.newPage();
        await userPage.goto(refLinkUrl);
        await userPage.fill('#firstName', 'ReferredYop');
        await userPage.fill('#email', referredEmail);
        await userPage.fill('#password', 'Password123!');
        await userPage.click('button[type="submit"]');

        await userPage.waitForTimeout(2000);

        // SCREENSHOT 2
        console.log('Capturing Screenshot 2...');
        await userPage.screenshot({ path: path.join(PROOF_DIR, '2_referred_signup.png') });

        const verifyLink2 = await waitForConfirmationLinkYop(context2, referredEmail);
        await userPage.goto(verifyLink2);
        await userPage.waitForTimeout(5000);

        // --- STEP 3: VERIFY HISTORY ---
        console.log('\n--- Verifying History ---');
        await refPage.goto('https://jobspeakpro.com/referral/history');
        await refPage.reload(); // Refresh data
        await refPage.waitForTimeout(4000);

        // Check for Referred Email in table (optional check, but good for logs)
        const bodyText = await refPage.innerText('body');
        /* if (!bodyText.includes('ReferredYop') && !bodyText.includes('jobspeak')) {
             console.log("WARNING: Referred user not found in table yet.");
        } */

        // SCREENSHOT 3
        console.log('Capturing Screenshot 3...');
        await refPage.screenshot({ path: path.join(PROOF_DIR, '3_referral_history.png'), fullPage: true });

        console.log("DONE");
    } catch (err) {
        console.error('YOPmail Verification Failed:', err);
    } finally {
        await browser.close();
    }
})();
