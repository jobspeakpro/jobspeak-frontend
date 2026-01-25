const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    // Ensure output directory exists
    const outputDir = path.resolve(__dirname, '../docs/proofs/final_polish_v1');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 } // Standard desktop
    });
    const page = await context.newPage();
    const baseUrl = 'http://localhost:4173';

    try {
        console.log('Starting verification run on: ' + baseUrl);

        // 1. Signup Success
        console.log('1. Signup...');
        await page.goto(`${baseUrl}/signup`);
        // Fill form with random email to ensure uniqueness if needed, or just dummy
        const uniqueEmail = `verify_${Date.now()}@example.com`;

        await page.fill('input[id="firstName"]', 'Verify User');
        await page.fill('input[id="email"]', uniqueEmail);
        await page.fill('input[id="password"]', 'password123');

        await page.click('button[type="submit"]');
        // Button text is "Create Account", but type="submit" is reliable.

        // Wait for success
        await page.waitForSelector('text=Check your email', { timeout: 15000 });
        await page.screenshot({ path: path.join(outputDir, '01_signup_success.png') });
        console.log('Captured 01_signup_success.png');

        // 2. Referral Page
        console.log('2. Referral Page...');
        await page.goto(`${baseUrl}/referral`);
        await page.waitForLoadState('networkidle');
        // Check for UniversalHeader presence (e.g. AvatarDropdown or Logo)
        // Check for "Your Unique Invite Link"
        await page.screenshot({ path: path.join(outputDir, '02_referral_page.png') });
        console.log('Captured 02_referral_page.png');

        // 3. Referral History
        console.log('3. Referral History...');
        await page.goto(`${baseUrl}/referral/history`); // Verify route
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: path.join(outputDir, '03_referral_history.png') });
        console.log('Captured 03_referral_history.png');

        // 4. Affiliate Landing
        console.log('4. Affiliate Landing...');
        await page.goto(`${baseUrl}/affiliate`);
        await page.waitForLoadState('networkidle');
        // Verify "Earn 30% Revenue Share" and "12-24 months"
        const textExists = await page.isVisible('text=12-24 months');
        if (!textExists) console.error('WARNING: "12-24 months" text not found!');
        await page.screenshot({ path: path.join(outputDir, '04_affiliate_landing.png') });
        console.log('Captured 04_affiliate_landing.png');

        // 5. Affiliate Apply Success
        console.log('5. Affiliate Apply...');
        await page.goto(`${baseUrl}/affiliate/apply`);
        await page.waitForLoadState('networkidle');
        await page.fill('input[id="full-name"]', 'Test Affiliate');
        await page.fill('input[id="email"]', 'affiliate_test@example.com');
        await page.selectOption('select[id="country"]', 'US');

        // Select Platform: Other
        await page.selectOption('select[id="platform"]', 'other');
        await page.fill('input[id="platform_other"]', 'MyCustomSite');

        await page.selectOption('select[id="audience"]', '<5k');
        await page.fill('input[id="link"]', 'https://example.com');
        await page.fill('textarea[id="strategy"]', 'Testing verification script');

        // Select Payout: Crypto
        // Need to click the radio button. It has name="payout" and value="crypto"
        await page.check('input[value="crypto"]');

        // Fill Crypto fields
        await page.fill('input[id="crypto_wallet"]', '0x1234567890abcdef');
        await page.selectOption('select[id="crypto_network"]', 'ERC20');

        await page.click('button[type="submit"]');

        // Wait for redirect to /affiliate/joined
        await page.waitForURL('**/affiliate/joined', { timeout: 10000 });
        await page.screenshot({ path: path.join(outputDir, '05_affiliate_apply_success.png') });
        console.log('Captured 05_affiliate_apply_success.png');

        // 6. Dropdown Menu
        console.log('6. Dropdown Menu...');
        // We need to be logged in to see the full menu? 
        // Or we can check the "Logged Out" menu if we were signed out by signup flow (which signs out at the end).
        // BUT the user asked for "shows Referral + Affiliate links". These are only in `loggedInItems`.
        // So we MUST be logged in. 
        // The Signup flow ends with "Sign out" (line 74 of SignUp.jsx). 
        // So we are currently logged out.
        // We need to LOGIN.
        await page.goto(`${baseUrl}/signin`);
        // We need a valid account to login. 
        // "Verify User" from step 1 is not confirmed, so likely can't login if confirmation is enforced.
        // IF confirmation is enforced, we are stuck.
        // However, I can try to login with a known test account or just assume I can see it?
        // Or maybe I can modify the state/localStorage to simulate login?
        // Or I can just check the code again... `SignUp.jsx` signs out.
        // Wait, if I can't login, I can't verify step 6.
        // I will try to login with the account I just created. 
        // If Supabase requires email confirmation, this will fail.
        // ALTERNATIVE: Use a "bypass" or "mock" but the user wants "LIVE PROOF".
        // I will try to click the avatar on a public page? No, it will show "Sign in".
        // Use the Demo/Test account? I don't have credentials.

        // hack: The `AvatarDropdown` uses `useAuth`.
        // I can screenshot the code? No.

        // I will Log in with the account I just created. If it fails, I will log error.
        // Actually, common dev setups might allow login without confirmation or I might have to skip.
        // Let's TRY to login.

        // But wait, step 6: "shows Referral + Affiliate links".
        // I'll try to login.
        try {
            await page.fill('input[type="email"]', uniqueEmail);
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Sign In")'); // Adjust selector
            await page.waitForURL('**/dashboard', { timeout: 5000 });

            // Now click avatar
            await page.click('button[aria-label="User menu"]');
            await page.waitForSelector('text=Referrals');
            await page.screenshot({ path: path.join(outputDir, '06_dropdown_menu.png') });
            console.log('Captured 06_dropdown_menu.png');
        } catch (e) {
            console.error('Login failed or could not verify dropdown (likely due to email confirmation):', e);
            // Fallback: Just take a screenshot of what we see
            await page.screenshot({ path: path.join(outputDir, '06_dropdown_menu_failed.png') });
        }

    } catch (error) {
        console.error('Error during verification:', error);
        try {
            const content = await page.content();
            console.log('--- PAGE CONTENT DUMP ---');
            console.log(content);
            console.log('--- END DUMP ---');
            await page.screenshot({ path: path.join(outputDir, 'error_state.png') });
        } catch (e) {
            console.error('Could not dump content:', e);
        }
    } finally {
        await browser.close();
    }
})();
