import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Config
const BASE_URL = 'https://jobspeakpro.com';
const MAILINATOR_DOMAIN = 'mailinator.com';
const PROOFS_DIR = path.resolve('docs/proofs/2026-01-27_referral_fix');

if (!fs.existsSync(PROOFS_DIR)) {
    fs.mkdirSync(PROOFS_DIR, { recursive: true });
}

// Helper: Timestamp
const ts = () => new Date().toISOString().replace(/[:.]/g, '-');

async function run() {
    const browser = await chromium.launch({ headless: false }); // Headless false to see it working (optional)
    const context = await browser.newContext();

    try {
        console.log("=== STARTING REFERRAL VERIFICATION (3 RUNS) ===");

        // --- PHASE 0: SETUP REFERRER ---
        console.log("\n[PHASE 0] Creating Referrer Account...");
        const page = await context.newPage();

        // 1. Signup Referrer
        const referrerEmail = `ref_host_${Date.now()}@${MAILINATOR_DOMAIN}`;
        console.log(`Referrer Email: ${referrerEmail}`);

        await page.goto(`${BASE_URL}/signup`);
        await page.fill('input[id="firstName"]', 'ReferrerHost');
        await page.fill('input[id="email"]', referrerEmail);
        await page.fill('input[id="password"]', 'Password123!');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000); // Wait for signup

        // 2. Confirm Email (Mailinator)
        console.log("Checking Mailinator for confirmation...");
        const mailPage = await context.newPage();
        await mailPage.goto(`https://www.mailinator.com/v4/public/inboxes.jsp?to=${referrerEmail.split('@')[0]}`);
        await mailPage.waitForSelector('td:has-text("Confirm your email")');
        await mailPage.click('td:has-text("Confirm your email")');
        // Switch to iframe or new tab? Mailinator usually opens email in place
        // Actually, mailinator often opens in iframe or similar. 
        // Simplified: Just extract the link if possible, or click.
        // Let's assume standard behavior: click row -> email body loads.
        await mailPage.waitForTimeout(2000);
        // Find link in iframe
        const iframeElement = await mailPage.waitForSelector('#html_msg_body');
        const frame = await iframeElement.contentFrame();
        const confirmUrl = await frame.$eval('a[href*="verify"]', el => el.href);
        console.log(`Confirmation Link: ${confirmUrl}`);
        await mailPage.close();

        // 3. Visit Confirmation Link
        await page.goto(confirmUrl);
        await page.waitForTimeout(3000); // Wait for auto-login or redirect

        // 4. Go to /referral and Get Code
        await page.goto(`${BASE_URL}/referral`);
        await page.waitForSelector('input[id="referral-link-input"]');

        // Screenshot: UI Overlap Desktop
        await page.screenshot({ path: path.join(PROOFS_DIR, `01_referral_desktop_${ts()}.png`) });
        console.log("Captured Desktop UI Screenshot");

        // Screenshot: UI Overlap Mobile
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(PROOFS_DIR, `02_referral_mobile_${ts()}.png`) });
        console.log("Captured Mobile UI Screenshot");
        await page.setViewportSize({ width: 1280, height: 720 }); // Restore

        const fullRefLink = await page.inputValue('input[id="referral-link-input"]');
        console.log(`Referral Link Captured: ${fullRefLink}`);
        const referralCode = fullRefLink.split('ref=')[1];

        if (!referralCode) throw new Error("Could not extract referral code");

        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear());
        // Close page to clear session more effectively
        await page.close();


        // --- RUNS 1, 2, 3 ---
        for (let i = 1; i <= 3; i++) {
            console.log(`\n[PHASE ${i}] Running Test User ${i}...`);
            const userPage = await context.newPage();

            // 1. Visit Link
            await userPage.goto(fullRefLink);
            await userPage.waitForTimeout(2000);

            // Verify localStorage
            const lsCode = await userPage.evaluate(() => localStorage.getItem('jsp_ref_code'));
            console.log(`[Run ${i}] localStorage 'jsp_ref_code': ${lsCode}`);
            if (lsCode !== referralCode) console.error(`[Run ${i}] WARNING: Code mismatch or missing!`);

            await userPage.screenshot({ path: path.join(PROOFS_DIR, `03_run${i}_landing_ref_${ts()}.png`) });

            // 2. Signup
            const userEmail = `ref_user${i}_${Date.now()}@${MAILINATOR_DOMAIN}`;
            console.log(`[Run ${i}] Signup as: ${userEmail}`);

            await userPage.goto(`${BASE_URL}/signup`); // Should preserve localStorage
            await userPage.fill('input[id="firstName"]', `User${i}`);
            await userPage.fill('input[id="email"]', userEmail);
            await userPage.fill('input[id="password"]', 'Password123!');

            // Listen for /claim request
            const claimPromise = userPage.waitForResponse(response =>
                response.url().includes('/referrals/claim') || response.url().includes('/referrals/track')
                , { timeout: 10000 }).catch(() => null);

            await userPage.click('button[type="submit"]');

            // Wait for claim
            const claimResponse = await claimPromise;
            if (claimResponse) {
                console.log(`[Run ${i}] Claim Response: ${claimResponse.status()}`);
            } else {
                console.log(`[Run ${i}] Claim request NOT detected (might happen on login instead?)`);
            }

            await userPage.waitForTimeout(5000); // Wait for signup processing

            // 3. Confirm Email
            const uMailPage = await context.newPage();
            await uMailPage.goto(`https://www.mailinator.com/v4/public/inboxes.jsp?to=${userEmail.split('@')[0]}`);
            await uMailPage.waitForSelector('td:has-text("Confirm your email")');
            await uMailPage.click('td:has-text("Confirm your email")');
            await uMailPage.waitForTimeout(2000);
            const uFrameEl = await uMailPage.waitForSelector('#html_msg_body');
            const uFrame = await uFrameEl.contentFrame();
            const uConfirmUrl = await uFrame.$eval('a[href*="verify"]', el => el.href);
            await uMailPage.close();

            // 4. Visit Confirm -> Auto Login
            await userPage.goto(uConfirmUrl);
            await userPage.waitForTimeout(5000); // Wait for login

            // Verify LS cleared?
            const lsAfter = await userPage.evaluate(() => localStorage.getItem('jsp_ref_code'));
            console.log(`[Run ${i}] localStorage after login: ${lsAfter}`);

            await userPage.screenshot({ path: path.join(PROOFS_DIR, `04_run${i}_dashboard_${ts()}.png`) });

            // Cleanup
            await userPage.context().clearCookies();
            await userPage.evaluate(() => localStorage.clear());
            await userPage.close();
        }


        // --- PHASE 4: FINAL CHECK ---
        console.log("\n[PHASE 4] Checking Referrer History...");
        const finalPage = await context.newPage();
        await finalPage.goto(`${BASE_URL}/signin`);
        await finalPage.fill('input[id="email"]', referrerEmail);
        await finalPage.fill('input[id="password"]', 'Password123!');
        await finalPage.click('button[type="submit"]');
        await finalPage.waitForTimeout(5000);

        await finalPage.goto(`${BASE_URL}/referral/history`);
        await finalPage.waitForSelector('table'); // Wait for table

        // Screenshot
        await finalPage.screenshot({ path: path.join(PROOFS_DIR, `05_final_history_${ts()}.png`) });
        console.log("Captured Final History Screenshot");

        console.log("=== VERIFICATION COMPLETE ===");

    } catch (err) {
        console.error("FATAL ERROR IN SCRIPT:", err);
    } finally {
        await browser.close();
    }
}

run();
