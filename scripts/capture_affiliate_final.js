import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROOF_DIR = path.join(__dirname, '../docs/proofs/2026-01-27_affiliate_final');

// Ensure proof directory exists
if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
}

(async () => {
    const browser = await chromium.launch({ headless: true }); // headless false if you want to see it, but headless true for script
    const context = await browser.newContext();
    const page = await context.newPage();

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    page.on('pageerror', err => {
        errors.push(err.message);
    });

    try {
        console.log('Navigating to Affiliate Apply Page...');
        await page.goto('https://jobspeakpro.com/affiliate/apply');

        // Fill form
        console.log('Filling form...');
        await page.fill('input#full-name', 'Test User');
        await page.fill('input#email', 'test@example.com');
        await page.selectOption('select#country', 'US');
        await page.selectOption('select#platform', 'blog');
        await page.selectOption('select#audience', '10k');
        await page.fill('input#link', 'https://example.com');
        await page.fill('textarea#strategy', 'SEO and Content Marketing');

        // Click PayPal
        await page.click('input[value="paypal"]');
        await page.waitForTimeout(500); // Animation
        await page.fill('input#paypal_email', 'paypal@example.com');

        // Submit
        console.log('Submitting form...');
        // We want to capture the moment of success or the redirect. 
        // The user asked for "01_apply_submit_success.png (network 200 visible)"
        // It's hard to visualize "network 200" in a screenshot unless we use devtools, 
        // but we can capture the page right after submit or intercept the request.

        const [response] = await Promise.all([
            page.waitForResponse(resp => resp.url().includes('/api/affiliate/apply') && resp.status() === 200),
            page.click('button[type="submit"]')
        ]);

        console.log('API Response status:', response.status());

        await page.screenshot({ path: path.join(PROOF_DIR, '01_apply_submit_success.png') });

        console.log('Waiting for redirect...');
        await page.waitForURL('**/affiliate/joined');

        console.log('On Joined Page. Verifying content...');
        await page.waitForSelector('text=We received your application. Our team will review it and contact you.');

        await page.screenshot({ path: path.join(PROOF_DIR, '02_joined_page_neutral_copy.png') });

        // Check Logo
        console.log('Checking Logo link...');
        const logoLink = page.locator('header a[href="/"]');
        await logoLink.first().click();

        await page.waitForURL('https://jobspeakpro.com/');
        console.log('Navigated to Home.');

        await page.screenshot({ path: path.join(PROOF_DIR, '03_logo_click_home.png') });

        // Write console clean
        if (errors.length === 0) {
            fs.writeFileSync(path.join(PROOF_DIR, 'console_clean.txt'), 'No console errors detected during the flow.');
        } else {
            fs.writeFileSync(path.join(PROOF_DIR, 'console_clean.txt'), 'Errors detected:\n' + errors.join('\n'));
        }

        console.log('Verification Complete. Proofs saved.');

    } catch (error) {
        console.error('Verification Failed:', error);
        fs.writeFileSync(path.join(PROOF_DIR, 'error_log.txt'), error.toString());
    } finally {
        await browser.close();
    }
})();
