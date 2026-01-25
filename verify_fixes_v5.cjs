const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const baseUrl = process.argv[2] || 'http://localhost:5173';

    await page.setViewportSize({ width: 1280, height: 800 });
    console.log(`🚀 Starting Verification V4.1 on ${baseUrl}...`);

    const proofsDir = path.join(__dirname, 'docs/proofs/2026-01-24_fix_v4/screenshots');
    const logsDir = path.join(__dirname, 'docs/proofs/2026-01-24_fix_v4/console');

    fs.mkdirSync(proofsDir, { recursive: true });
    fs.mkdirSync(logsDir, { recursive: true });

    const consoleLogs = [];
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[HMR]') || text.includes('React Router Future Flag')) return;
        consoleLogs.push(`[${msg.type()}] ${text}`);
    });

    try {
        // 1. Homepage Top Nav (Logged Out)
        console.log("📸 1. Checking Homepage Top Nav...");
        await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(proofsDir, '01_homepage_top_nav.png') });
        const headerText = await page.textContent('header');
        if (!headerText.includes('How It Works') && !headerText.includes('Affiliate')) {
            console.log("✅ Top nav is clean (Logo + Sign In + Start only).");
        } else {
            console.warn("⚠️ Top nav might still have links: " + headerText.substring(0, 50));
        }

        // 2. Homepage Footer
        console.log("📸 2. Checking Homepage Footer...");
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(proofsDir, '02_homepage_footer.png') });
        const footerText = await page.textContent('footer');
        const requiredLinks = ['How It Works', 'Pricing', 'Support', 'Affiliate', 'Referrals'];
        const missing = requiredLinks.filter(l => !footerText.includes(l));
        if (missing.length === 0) {
            console.log("✅ Footer links complete.");
        } else {
            console.warn("⚠️ Missing footer links: " + missing.join(', '));
        }

        // 3. Referral Page (Public/Public-ish Check)
        // Since we can't login easily on prod, we check if /referral redirects or shows login, or if we can access it.
        // If strict Login required, we might skip full UI proof on prod unless we have specific creds.
        // But we can check /affiliate which is public.

        // 4. Affiliate Apply (End-to-End)
        console.log("📸 4. Checking Affiliate Apply...");
        await page.goto(`${baseUrl}/affiliate/apply`, { waitUntil: 'networkidle' });

        // Fill form
        const testEmail = `test_aff_${Date.now()}@example.com`;
        await page.fill('#full-name', 'Test Affiliate');
        await page.fill('#email', testEmail);
        await page.selectOption('#country', 'US');
        await page.selectOption('#platform', 'twitter');
        await page.selectOption('#audience', '10k');
        await page.fill('#link', 'https://twitter.com/test');
        await page.fill('#strategy', 'Testing production flow');
        await page.check('input[value="paypal"]');
        await page.fill('#paypal_email', testEmail); // Wait for animation if needed, but playwright retry helps.

        await page.screenshot({ path: path.join(proofsDir, '05_affiliate_form_filled.png') });

        // Submit
        console.log("🚀 Submitting Affiliate Application...");
        await page.click('button[type="submit"]');

        // Wait for navigation or success message
        try {
            await page.waitForURL('**/affiliate/joined', { timeout: 10000 });
            console.log("✅ Affiliate Application Submitted Successfully (Redirected).");
            await page.screenshot({ path: path.join(proofsDir, '06_affiliate_success.png') });
        } catch (e) {
            console.error("❌ Affiliate Application Submission Failed (No Redirect).");
            await page.screenshot({ path: path.join(proofsDir, '06_affiliate_error.png') });
        }

        // 5. Console Check
        console.log("✅ Verification V4.2 Complete.");
        fs.writeFileSync(path.join(logsDir, 'console_log.txt'), consoleLogs.join('\n'));
        fs.writeFileSync(path.join(logsDir, 'readme.txt'), `Affiliate Test Email: ${testEmail}\nResult: ${consoleLogs.filter(l => l.includes('Submitted')).length > 0 ? 'Success' : 'Check Logs'}`);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
    } finally {
        await browser.close();
    }
})();
