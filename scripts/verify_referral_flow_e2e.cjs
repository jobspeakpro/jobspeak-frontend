const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROOF_DIR = path.resolve(__dirname, '../docs/proofs/referral_e2e');
if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

// Helper to fetch via Browser Page to avoid bot detection/Cloudflare blocks
async function browserFetch(context, url) {
    const page = await context.newPage();
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // Extract JSON from body (it's returned as raw text often)
        const text = await page.innerText('body');
        return JSON.parse(text);
    } catch (e) {
        console.error(`Browser fetch failed for ${url}:`, e);
        // If parsing failed, maybe we got HTML error page?
        // Return null to retry
        return null;
    } finally {
        await page.close();
    }
}

async function getTempEmail(context) {
    const data = await browserFetch(context, 'https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
    if (!data) throw new Error("Failed to generate email");
    return data[0];
}

const parseEmail = (email) => {
    const [login, domain] = email.split('@');
    return { login, domain };
};

async function waitForConfirmationLink(context, email) {
    const { login, domain } = parseEmail(email);
    console.log(`Waiting for email to ${email}...`);

    for (let i = 0; i < 30; i++) { // Wait up to 90s
        await new Promise(r => setTimeout(r, 4000));
        try {
            const msgs = await browserFetch(context, `https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
            if (msgs && msgs.length > 0) {
                console.log('Message received!');
                const msgId = msgs[0].id;
                // Fetch body
                const detail = await browserFetch(context, `https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${msgId}`);
                if (!detail) continue;

                const html = detail.body || "";

                // Find link
                const links = html.match(/href="([^"]+)"/g);
                if (links) {
                    for (const l of links) {
                        const url = l.slice(6, -1).replace(/&amp;/g, '&');
                        if ((url.includes('jobspeakpro.com') || url.includes('supabase')) && !url.includes('unsubscribe')) {
                            console.log('Found verification link:', url);
                            return url;
                        }
                    }
                }
            }
        } catch (e) {
            console.log('Polling retry...');
        }
    }
    throw new Error('Email timeout');
}

(async () => {
    console.log("Launching browser...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // --- STEP 1: CREATE REFERRER ---
        console.log('\n--- Creating REFERRER ---');
        const referrerEmail = await getTempEmail(context);
        const password = 'Password123!';

        console.log(`Referrer Email: ${referrerEmail}`);

        await page.goto('https://jobspeakpro.com/signup');
        await page.fill('input[type="text"]', 'ReferrerUser'); // First name based on placeholder? id="firstName"
        // Check selectors if needed, previous script assumed #firstName
        // SignUp.jsx: id="firstName", id="email", id="password"
        // Let's use specific selector to be safe
        await page.fill('#firstName', 'ReferrerUser');
        await page.fill('#email', referrerEmail);
        await page.fill('#password', password);
        await page.click('button[type="submit"]');

        await page.waitForTimeout(5000);

        const link = await waitForConfirmationLink(context, referrerEmail);
        await page.goto(link);
        await page.waitForTimeout(5000); // Wait for verify

        console.log('Logging in Referrer...');
        await page.goto('https://jobspeakpro.com/signin');
        await page.fill('#email', referrerEmail);
        await page.fill('#password', password);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');

        console.log('Visiting /referral...');
        await page.goto('https://jobspeakpro.com/referral');
        await page.waitForSelector('input[readonly]');

        // SCREENSHOT 1
        console.log('Capturing Screenshot 1...');
        await page.screenshot({ path: path.join(PROOF_DIR, 'step1_referrer_view.png') });

        const inviteLink = await page.inputValue('input[readonly]');
        const referralCode = inviteLink.split('ref/')[1];
        if (!referralCode) throw new Error("Could not extract code");
        console.log(`Referral Code: ${referralCode}`);

        // --- STEP 2: CREATE REFERRED ---
        // Clear cookies to be "Incognito"
        await context.clearCookies();

        console.log('\n--- Creating REFERRED ---');
        const referredEmail = await getTempEmail(context);
        console.log(`Referred Email: ${referredEmail}`);

        const signupUrl = `https://jobspeakpro.com/signup?ref=${referralCode}`;
        console.log(`Visiting ${signupUrl}`);

        await page.goto(signupUrl);
        await page.fill('#firstName', 'ReferredUser');
        await page.fill('#email', referredEmail);
        await page.fill('#password', password);
        await page.click('button[type="submit"]');

        // Wait for "Check your email" or similar success state
        await page.waitForTimeout(2000);

        // SCREENSHOT 2: "Capture screenshot of successful signup"
        // This is usually the "Check your email" screen
        console.log('Capturing Screenshot 2...');
        await page.screenshot({ path: path.join(PROOF_DIR, 'step2_referred_signup.png') });

        const link2 = await waitForConfirmationLink(context, referredEmail);
        await page.goto(link2);
        await page.waitForTimeout(5000);

        // --- STEP 3: VERIFY HISTORY ---
        await context.clearCookies();

        console.log('\n--- Verifying History (Referrer) ---');
        await page.goto('https://jobspeakpro.com/signin');
        await page.fill('#email', referrerEmail);
        await page.fill('#password', password);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard');

        console.log('Visiting /referral/history...');
        await page.goto('https://jobspeakpro.com/referral/history');

        // Wait for data load
        await page.waitForTimeout(4000);

        // SCREENSHOT 3
        console.log('Capturing Screenshot 3...');
        await page.screenshot({ path: path.join(PROOF_DIR, 'step3_referral_history.png') });

        console.log("DONE");

    } catch (err) {
        console.error('Verification Failed:', err);
    } finally {
        await browser.close();
    }
})();
