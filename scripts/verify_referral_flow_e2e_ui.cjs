const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROOF_DIR = path.resolve(__dirname, '../docs/proofs/referral_e2e');
if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

async function getEmailFromUI(context) {
    const page = await context.newPage();
    await page.goto('https://www.1secmail.com/', { waitUntil: 'domcontentloaded' });

    // Wait for email input to be populated
    // 1secmail usually has input#login and select#domain
    // Or just #email helper
    // We'll scrape login and domain values
    await page.waitForSelector('#login');
    const login = await page.inputValue('#login');
    const domain = await page.inputValue('#domain');
    const email = `${login}@${domain}`;

    console.log(`Generated email via UI: ${email}`);
    return { email, page };
}

async function checkEmailUI(mailPage) {
    // Click refresh?
    // 1secmail auto-refreshes but we can force it
    // Button is usually 'Check' or text 'Refresh'
    // Selector often: button or a.
    // We'll just wait for #msgList or similar

    // Try to click refresh button if exists (varies by design, usually 'Check mails' or icon)
    // We'll reload the page to be safe if refresh button is ambiguous
    await mailPage.reload();

    // Check for message links
    // table#messageTable or div.message-list
    // Link usually contains subject "Confirm..."

    // Get all links
    const links = await mailPage.$$('a');
    for (const link of links) {
        const text = await link.innerText();
        if (text.includes('Confirm') || text.includes('Verify') || text.includes('JobSpeak')) {
            console.log(`Found message: ${text}`);
            return link; // Handle to click
        }
    }
    return null;
}

async function waitForConfirmationLinkUI(mailPage) {
    console.log('Waiting for email (UI polling)...');
    for (let i = 0; i < 20; i++) {
        await mailPage.waitForTimeout(4000);
        const msgLink = await checkEmailUI(mailPage);
        if (msgLink) {
            await msgLink.click();
            await mailPage.waitForLoadState('domcontentloaded');
            // Now reading message
            // Link is in body
            const body = await mailPage.innerText('body');
            const match = body.match(/https:\/\/.*?verify[^\s"<]*/); // Regex for verify link
            if (match) return match[0];

            // Try to find expected link structure in hrefs
            const links = await mailPage.$$eval('a', as => as.map(a => a.href));
            for (const l of links) {
                if (l.includes('verify') && l.includes('token')) return l;
            }
        }
    }
    throw new Error('Email timeout in UI');
}

(async () => {
    console.log("Launching browser (UI Mode)...");
    const browser = await chromium.launch({ headless: true });

    try {
        // --- CONTEXT 1: REFERRER ---
        const context1 = await browser.newContext();

        console.log('\n--- Referrer Setup ---');
        const { email: refEmail, page: refMailPage } = await getEmailFromUI(context1);

        const refPage = await context1.newPage();
        await refPage.goto('https://jobspeakpro.com/signup');
        await refPage.fill('#firstName', 'ReferrerUI');
        await refPage.fill('#email', refEmail);
        await refPage.fill('#password', 'Password123!');
        await refPage.click('button[type="submit"]');

        const verifyLink1 = await waitForConfirmationLinkUI(refMailPage);
        await refPage.goto(verifyLink1); // Open link in main page
        await refPage.waitForTimeout(5000);

        // Login
        await refPage.goto('https://jobspeakpro.com/signin');
        await refPage.fill('#email', refEmail);
        await refPage.fill('#password', 'Password123!');
        await refPage.click('button[type="submit"]');
        await refPage.waitForURL('**/dashboard');

        // Get Code
        await refPage.goto('https://jobspeakpro.com/referral');
        await refPage.waitForSelector('input[readonly]');
        await refPage.screenshot({ path: path.join(PROOF_DIR, '1_referrer_code.png'), fullPage: true });
        console.log('Saved 1_referrer_code.png');

        const inviteLink = await refPage.inputValue('input[readonly]');
        const referralCode = inviteLink.split('ref/')[1];
        console.log(`Referral Code: ${referralCode}`);

        // --- CONTEXT 2: REFERRED ---
        const context2 = await browser.newContext();
        console.log('\n--- Referred Setup ---');
        const { email: referredEmail, page: referredMailPage } = await getEmailFromUI(context2);

        const referredPage = await context2.newPage();
        const signupUrl = `https://jobspeakpro.com/signup?ref=${referralCode}`;
        await referredPage.goto(signupUrl);
        await referredPage.fill('#firstName', 'ReferredUI');
        await referredPage.fill('#email', referredEmail);
        await referredPage.fill('#password', 'Password123!');
        await referredPage.click('button[type="submit"]');

        await referredPage.waitForTimeout(2000);
        await referredPage.screenshot({ path: path.join(PROOF_DIR, '2_referred_signup.png') });
        console.log('Saved 2_referred_signup.png');

        // Verify Referred to create user
        const verifyLink2 = await waitForConfirmationLinkUI(referredMailPage);
        await referredPage.goto(verifyLink2);
        await referredPage.waitForTimeout(5000); // Allow tracking to finalize if tied to auth

        // --- BACK TO CONTEXT 1 ---
        console.log('\n--- Verifying History ---');
        // Ensure we are logged in (session persists in context1)
        await refPage.goto('https://jobspeakpro.com/referral/history');
        await refPage.reload(); // Refresh to catch new data
        await refPage.waitForTimeout(4000);

        await refPage.screenshot({ path: path.join(PROOF_DIR, '3_referral_history.png'), fullPage: true });
        console.log('Saved 3_referral_history.png');

    } catch (err) {
        console.error('UI Verification Failed:', err);
    } finally {
        await browser.close();
    }
})();
