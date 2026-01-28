import { chromium } from 'playwright';
import path from 'path';

const PROOFS_DIR = 'C:\\\\Users\\\\Admin\\\\.gemini\\\\antigravity\\\\brain\\\\5b8240c7-2c92-48c7-8f3b-59981c41784f';
const BASE_URL = 'https://jobspeakpro.com';

async function captureProofs() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    try {
        console.log('=== CAPTURING PROOF SCREENSHOTS ===');

        // TASK 1 - Desktop /referral
        console.log('\\n[1/6] Capturing /referral desktop...');
        const desktopPage = await context.newPage();
        await desktopPage.setViewportSize({ width: 1280, height: 720 });
        await desktopPage.goto(`${BASE_URL}/referral`);
        await desktopPage.waitForTimeout(3000);
        await desktopPage.screenshot({ path: path.join(PROOFS_DIR, '01_referral_desktop.png'), fullPage: true });
        console.log('✓ Desktop screenshot saved');
        await desktopPage.close();

        // TASK 1 - Mobile /referral
        console.log('\\n[2/6] Capturing /referral mobile...');
        const mobilePage = await context.newPage();
        await mobilePage.setViewportSize({ width: 375, height: 812 });
        await mobilePage.goto(`${BASE_URL}/referral`);
        await mobilePage.waitForTimeout(3000);
        await mobilePage.screenshot({ path: path.join(PROOFS_DIR, '02_referral_mobile.png'), fullPage: true });
        console.log('✓ Mobile screenshot saved');
        await mobilePage.close();

        // TASK 2 - localStorage capture
        console.log('\\n[3/6] Capturing localStorage proof...');
        const lsPage = await context.newPage();
        await lsPage.goto(`${BASE_URL}?ref=REF-TEST123`);
        await lsPage.waitForTimeout(2000);

        // Open DevTools console and show localStorage
        await lsPage.evaluate(() => {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:20px;right:20px;background:white;border:2px solid #197fe6;padding:20px;z-index:99999;font-family:monospace;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
            const code = localStorage.getItem('jsp_ref_code');
            overlay.innerHTML = `<strong style="color:#197fe6;">localStorage.jsp_ref_code</strong><br/><code style="background:#f0f0f0;padding:4px 8px;display:block;margin-top:8px;">${code || 'NOT SET'}</code>`;
            document.body.appendChild(overlay);
        });
        await lsPage.waitForTimeout(1000);
        await lsPage.screenshot({ path: path.join(PROOFS_DIR, '03_localstorage_proof.png') });
        console.log('✓ localStorage screenshot saved');
        await lsPage.close();

        // TASK 3 - Network tab proof (signin with ref code)
        console.log('\\n[4/6] Capturing network proof (auto-claim)...');
        const networkPage = await context.newPage();

        // Set ref code in localStorage first
        await networkPage.goto(BASE_URL);
        await networkPage.evaluate(() => {
            localStorage.setItem('jsp_ref_code', 'REF-NETWORK-TEST');
        });

        // Navigate to signin
        await networkPage.goto(`${BASE_URL}/signin`);
        await networkPage.waitForTimeout(2000);

        // Fill and submit (will fail auth but that's ok, we just need to see the claim call attempt)
        await networkPage.fill('input[id="email"]', 'test@example.com');
        await networkPage.fill('input[id="password"]', 'testpass123');

        // Listen for network request
        let claimCalled = false;
        networkPage.on('request', req => {
            if (req.url().includes('/referrals/claim')) {
                claimCalled = true;
            }
        });

        await networkPage.click('button[type="submit"]');
        await networkPage.waitForTimeout(3000);

        // Show network overlay
        await networkPage.evaluate((called) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:20px;right:20px;background:white;border:2px solid #197fe6;padding:20px;z-index:99999;font-family:monospace;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:400px;';
            overlay.innerHTML = `<strong style="color:#197fe6;">Network Monitor</strong><br/><code style="background:#f0f0f0;padding:4px 8px;display:block;margin-top:8px;">POST /api/referrals/claim: ${called ? '✓ CALLED' : '✗ NOT CALLED'}</code>`;
            document.body.appendChild(overlay);
        }, claimCalled);
        await networkPage.waitForTimeout(1000);
        await networkPage.screenshot({ path: path.join(PROOFS_DIR, '04_network_autoclaim.png') });
        console.log('✓ Network screenshot saved');
        await networkPage.close();

        // TASK 4 - History page with real rows
        console.log('\\n[5/6] Capturing /referral/history...');
        const historyPage = await context.newPage();
        await historyPage.goto(`${BASE_URL}/referral/history`);
        await historyPage.waitForTimeout(3000);
        await historyPage.screenshot({ path: path.join(PROOFS_DIR, '05_referral_history.png'), fullPage: true });
        console.log('✓ History screenshot saved');
        await historyPage.close();

        // TASK 5 - Invite button toast
        console.log('\\n[6/6] Capturing invite button toast...');
        const toastPage = await context.newPage();
        await toastPage.goto(`${BASE_URL}/referral`);
        await toastPage.waitForTimeout(2000);

        // Click copy button
        await toastPage.click('button[data-testid="referral-copy"]');
        await toastPage.waitForTimeout(1500); // Wait for toast
        await toastPage.screenshot({ path: path.join(PROOFS_DIR, '06_invite_toast.png') });
        console.log('✓ Toast screenshot saved');
        await toastPage.close();

        console.log('\\n=== ALL PROOFS CAPTURED ===');

    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await browser.close();
    }
}

captureProofs();
