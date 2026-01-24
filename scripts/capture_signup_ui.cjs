const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROOF_DIR = path.resolve(__dirname, '../docs/proofs/signup_capture');
if (!fs.existsSync(PROOF_DIR)) fs.mkdirSync(PROOF_DIR, { recursive: true });

(async () => {
    console.log("Launching details capture...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Visiting Signup...');
        await page.goto('https://jobspeakpro.com/signup');
        await page.screenshot({ path: path.join(PROOF_DIR, 'signup_page.png') });
        console.log('Saved signup_page.png');

        await page.fill('#firstName', 'TestUser');
        await page.fill('#email', `test_user_${Date.now()}@example.com`);
        await page.fill('#password', 'Password123!');
        await page.click('button[type="submit"]');

        console.log('Submitted form...');
        await page.waitForTimeout(3000);

        // Check for success text
        const content = await page.content();
        if (content.includes("Check your email") || content.includes("Account created")) {
            console.log("Success state detected.");
        } else {
            console.log("Success state NOT obvious.");
        }

        await page.screenshot({ path: path.join(PROOF_DIR, 'signup_success_state.png'), fullPage: true });
        console.log('Saved signup_success_state.png');

    } catch (err) {
        console.error('Capture Failed:', err);
    } finally {
        await browser.close();
    }
})();
