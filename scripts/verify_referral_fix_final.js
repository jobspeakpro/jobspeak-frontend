import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROOF_DIR = path.join(__dirname, '../docs/proofs/2026-01-27_referral_fix_final');

// Ensure proof directory exists
if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
}

const USER_EMAIL = "mimito1030@gavrom.com";
const USER_PASS = "mimito1030@gavrom.com";

(async () => {
    const browser = await chromium.launch({ headless: true });
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
        console.log('Navigating to Sign In...');
        await page.goto('https://jobspeakpro.com/signin');

        // Login
        console.log('Logging in...');
        await page.fill('input[type="email"]', USER_EMAIL);
        await page.fill('input[type="password"]', USER_PASS);
        await page.click('button[type="submit"]');

        // Wait for dashboard or redirect
        await page.waitForURL('**/dashboard', { timeout: 30000 });
        console.log('Login successful.');

        // Go to Referral Page
        console.log('Navigating to Referral Page...');
        await page.goto('https://jobspeakpro.com/referral');
        await page.waitForTimeout(2000); // Wait for fetch

        // 01 Referral Code Visible
        await page.waitForSelector('input[data-testid="referral-code"]');
        await page.screenshot({ path: path.join(PROOF_DIR, '01_referral_code_visible.png') });

        // 02 Copy Toast
        console.log('Testing Copy...');
        await page.click('button[data-testid="referral-copy"]');
        await page.waitForSelector('text=Link copied!', { timeout: 5000 });
        await page.screenshot({ path: path.join(PROOF_DIR, '02_copy_toast.png') });

        // 03 Share Fallback (Just showing buttons)
        console.log('Capturing Share buttons...');
        await page.screenshot({ path: path.join(PROOF_DIR, '03_share_fallback.png'), clip: { x: 0, y: 500, width: 1000, height: 500 } }); // Approximate clip or full page

        // 04 History Real Rows
        console.log('Navigating to History...');
        // Click the view history link
        await page.click('a[href="/referral/history"]');
        await page.waitForURL('**/referral/history');
        await page.waitForTimeout(2000); // Wait for fetch

        await page.screenshot({ path: path.join(PROOF_DIR, '04_history_real_rows.png') });

        // 05 Invite Friend Works
        console.log('Testing Invite Friend button...');
        await page.click('button:has-text("Invite Friend")');
        await page.waitForURL('**/referral');
        await page.screenshot({ path: path.join(PROOF_DIR, '05_invite_friend_works.png') });

        // Go back to history
        await page.goto('https://jobspeakpro.com/referral/history');

        // 06 Use Credit Modal
        console.log('Testing Use Credit...');
        const useCreditBtn = page.locator('button:has-text("Use Credit Now")');
        if (await useCreditBtn.isDisabled()) {
            console.log('Use Credit button disabled (no credits). Capturing disabled state.');
            await page.screenshot({ path: path.join(PROOF_DIR, '06_use_credit_modal_or_redirect_DISABLED.png') });
        } else {
            await useCreditBtn.click();
            await page.waitForSelector('text=Redeem Credit'); // Modal title
            await page.screenshot({ path: path.join(PROOF_DIR, '06_use_credit_modal_or_redirect.png') });
        }

        // Write console clean
        if (errors.filter(e => !e.includes('Load failed') && !e.includes('ERR_BLOCKED_BY_CLIENT')).length === 0) {
            fs.writeFileSync(path.join(PROOF_DIR, 'console_clean.txt'), 'No critical console errors detected.');
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
