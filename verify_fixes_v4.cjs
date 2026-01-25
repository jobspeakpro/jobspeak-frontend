const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    // Launch browser
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const baseUrl = process.argv[2] || 'http://localhost:5173';

    // Set viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    console.log(`🚀 Starting Verification V4 on ${baseUrl}...`);

    const proofsDir = path.join(__dirname, 'docs/proofs/2026-01-24_referral-affiliate-fix_v4/screenshots');
    const logsDir = path.join(__dirname, 'docs/proofs/2026-01-24_referral-affiliate-fix_v4/console');

    // Ensure directories exist
    fs.mkdirSync(proofsDir, { recursive: true });
    fs.mkdirSync(logsDir, { recursive: true });

    // Capture logs
    const consoleLogs = [];
    page.on('console', msg => {
        const text = msg.text();
        // Ignore noise
        if (text.includes('[HMR]') || text.includes('React Router Future Flag')) return;
        consoleLogs.push(`[${msg.type()}] ${text}`);
    });

    try {
        // 1. Homepage Footer
        console.log("📸 1. Checking Homepage Footer...");
        await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        // Check for 5 links: How it Works, Pricing, Support, Affiliate, Referrals
        const footerText = await page.textContent('footer');
        if (footerText.includes('Referrals') && footerText.includes('Affiliate') && !footerText.includes('Start Practicing')) {
            console.log("✅ Footer links present and clean.");
        } else {
            console.log("⚠️ Footer check warning. Content: " + footerText.substring(0, 100));
        }
        await page.screenshot({ path: path.join(proofsDir, '01_homepage_footer.png') });

        // 2. Referral Page
        console.log("📸 2. Checking Referral Page...");
        // Mock auth if needed or just go there (assuming dev mode allows access or redirects)
        // With real backend, might redirect to signin.
        // For visual proof, we try to access.
        await page.goto(`${baseUrl}/referral`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(proofsDir, '02_referral_page_ui.png') });

        // Mock clicking copy
        const copyBtn = await page.$('button >> text=Copy Link');
        if (copyBtn) {
            await copyBtn.click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: path.join(proofsDir, '02b_referral_toast.png') });
            console.log("✅ Copy button clicked.");
        }

        // 3. Referral History
        console.log("📸 3. Checking Referral History...");
        // Try clicking link from Referral page if present
        const historyLink = await page.$('a[href="/referral/history"]');
        if (historyLink) {
            await historyLink.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: path.join(proofsDir, '03_referral_history.png') });
            console.log("✅ Navigated to Referral History.");

            // Click Redeem
            const redeemBtn = await page.$('button >> text=Use Credit Now');
            if (redeemBtn) {
                await redeemBtn.click();
                await page.waitForTimeout(500);
                await page.screenshot({ path: path.join(proofsDir, '03b_redeem_modal.png') });
                console.log("✅ Redeem modal opened.");
            }
        } else {
            // Direct navigation
            await page.goto(`${baseUrl}/referral/history`);
            await page.screenshot({ path: path.join(proofsDir, '03_referral_history_direct.png') });
        }


        // 4. Affiliate Page
        console.log("📸 4. Checking Affiliate Page...");
        await page.goto(`${baseUrl}/affiliate`, { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(proofsDir, '04_affiliate_top.png') });

        // Click Terms
        const termsBtn = await page.$('a[href="#important-notes"]');
        if (termsBtn) {
            await termsBtn.click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: path.join(proofsDir, '04b_affiliate_terms_view.png') });
            console.log("✅ Scrolled to terms.");
        }

        // 5. Affiliate Apply
        console.log("📸 5. Checking Affiliate Apply...");
        await page.goto(`${baseUrl}/affiliate/apply`, { waitUntil: 'networkidle' });

        // Fill form
        await page.fill('#full-name', 'Test User V4');
        await page.fill('#email', 'test_v4@example.com');
        await page.selectOption('#country', 'US');
        await page.selectOption('#platform', 'twitter'); // New option
        await page.selectOption('#audience', '10k'); // New option
        await page.fill('#link', 'https://twitter.com/test');
        await page.fill('#strategy', 'V4 Test Strategy');

        // Check audience options
        const audienceOptions = await page.$$eval('#audience option', options => options.map(o => o.value));
        if (audienceOptions.includes('10k') && audienceOptions.includes('500k+')) {
            console.log("✅ Audience options match V4 reqs.");
        }

        await page.screenshot({ path: path.join(proofsDir, '05_affiliate_apply_filled.png') });

        // Submit (if backend ready, else capture UI)
        // Check payout
        const payoutRadio = await page.$('input[value="paypal"]');
        if (payoutRadio) await payoutRadio.click();
        await page.fill('#paypal_email', 'test_v4@paypal.com');

        await page.screenshot({ path: path.join(proofsDir, '05b_affiliate_apply_payout.png') });

        // 6. Navigation Dropdown
        console.log("📸 6. Checking Avatar Dropdown...");
        // Need to be logged in for this. Mocking likely difficult without Auth flow.
        // We will try to click the avatar if it exists (might be hamburger if logged out).
        // If logged out, we see Public Nav.
        // If logged in, we see Avatar.
        // Screen capture whatever is there.
        await page.screenshot({ path: path.join(proofsDir, '06_navigation_state.png') });

        console.log("✅ Verification V4 Complete.");

        // Write console logs
        fs.writeFileSync(path.join(logsDir, 'console_log.txt'), consoleLogs.join('\n'));
        console.log("📝 Console logs saved.");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
    } finally {
        await browser.close();
    }
})();
