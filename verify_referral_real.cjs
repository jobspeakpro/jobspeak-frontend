const { chromium } = require('playwright');
const fs = require('fs');

// CONFIG
// We will create random users
const BASE_URL = 'https://jobspeakpro.com';
const PROOF_DIR = 'docs/proofs/2026-01-27_referral_real_history';

if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

function generateUser() {
    const id = Math.random().toString(36).substring(7);
    return {
        email: `test.referral.${id}@jobspeakpro-test.local`,
        password: 'Password123!',
        name: `Test User ${id}`
    };
}

async function runRealTest() {
    console.log("Starting Real Referral Test...");
    const browser = await chromium.launch({ headless: true });

    // 1. Create Referrer
    const referrer = generateUser();
    console.log(`Referrer: ${referrer.email}`);

    const contextA = await browser.newContext({ recordVideo: { dir: PROOF_DIR } });
    const pageA = await contextA.newPage();

    // SignUp Referrer
    await pageA.goto(`${BASE_URL}/signup`);
    await pageA.fill('input[name="email"]', referrer.email);
    await pageA.fill('input[name="password"]', referrer.password);
    // Assuming simple signup flow, adjust selectors if needed
    // Look for generic buttons if specific IDs missing
    await pageA.click('button[type="submit"]');
    await pageA.waitForURL(`${BASE_URL}/dashboard`, { timeout: 30000 });

    // Get Code
    await pageA.goto(`${BASE_URL}/referral`);
    const linkInput = pageA.locator('input[readonly]');
    const referralLink = await linkInput.inputValue();
    const referralCode = referralLink.split('ref=')[1];
    console.log(`Referral Code: ${referralCode}`);

    if (!referralCode) throw new Error("Could not get referral code");

    await contextA.close(); // Close session A temporarily

    // 2. Referees SignUp
    const referees = [generateUser(), generateUser(), generateUser()];

    for (const referee of referees) {
        console.log(`Signing up Referee: ${referee.email}`);
        const contextRef = await browser.newContext();
        // Force clean storage
        await contextRef.clearCookies();
        const pageRef = await contextRef.newPage();

        // Visit Referral Link
        await pageRef.goto(`${BASE_URL}?ref=${referralCode}`);
        // Store ref verification? specific to app logic usually localstorage

        await pageRef.goto(`${BASE_URL}/signup`);
        await pageRef.fill('input[name="email"]', referee.email);
        await pageRef.fill('input[name="password"]', referee.password);
        await pageRef.click('button[type="submit"]');
        await pageRef.waitForURL(`${BASE_URL}/dashboard`, { timeout: 30000 });

        console.log(`Referee ${referee.email} signed up.`);
        await contextRef.close();
    }

    // 3. Verify History
    console.log("Verifying History...");
    const contextCheck = await browser.newContext();
    const pageCheck = await contextCheck.newPage();
    await pageCheck.goto(`${BASE_URL}/signin`);
    await pageCheck.fill('input[type="email"]', referrer.email);
    await pageCheck.fill('input[type="password"]', referrer.password);
    await pageCheck.click('button[type="submit"]');
    await pageCheck.waitForURL(`${BASE_URL}/dashboard`);

    await pageCheck.goto(`${BASE_URL}/referral/history`);
    await pageCheck.waitForSelector('table');

    // Screenshot
    await pageCheck.screenshot({ path: `${PROOF_DIR}/referral_history_proof.png` });

    const rows = await pageCheck.locator('tbody tr').count();
    console.log(`Found ${rows} rows in history.`);

    if (rows !== 3) {
        console.error("FAIL: Expected 3 rows.");
    } else {
        console.log("SUCCESS: 3 rows found.");
    }

    await browser.close();
}

runRealTest().catch(console.error);
