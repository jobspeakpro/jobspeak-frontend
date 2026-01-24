
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

// FIX: Handle Windows Environment
const home = process.env.HOME || process.env.USERPROFILE || os.homedir();
process.env.HOME = home;
process.env.USERPROFILE = process.env.USERPROFILE || home;

// Screenshots dir
const proofDir = path.join(__dirname, 'docs', 'proofs', 'activity');
if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

(async () => {
    console.log('🚀 Starting FINAL VISUAL PROOF...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    try {
        // 1. Practice -> Dashboard
        console.log('▶️ Flow 1: Practice -> Dashboard');
        await page.goto('https://jobspeakpro.com/practice?skipOnboarding=1');
        await page.waitForResponse(resp => resp.url().includes('/api/activity/start') && resp.status() === 200);
        console.log('✅ Practice Started (200 OK)');

        await page.goto('https://jobspeakpro.com/dashboard');
        console.log('Waiting for Dashboard UI...');
        await page.waitForSelector('[data-testid="activity-row"]', { timeout: 15000 });
        console.log('✅ Dashboard UI Visible');

        await page.screenshot({ path: path.join(proofDir, 'FINAL_dashboard_ui.png'), fullPage: true });

        // 2. Mock -> Progress
        console.log('▶️ Flow 2: Mock -> Progress');
        await page.goto('https://jobspeakpro.com/mock-interview/session?type=short');
        await page.waitForResponse(resp => resp.url().includes('/api/activity/start') && resp.status() === 200);
        console.log('✅ Mock Started (200 OK)');

        console.log('Waiting for Progress API...');
        const progressResponsePromise = page.waitForResponse(resp => resp.url().includes('/api/progress') && resp.status() === 200);
        await page.goto('https://jobspeakpro.com/progress');

        const progressResponse = await progressResponsePromise;
        try {
            const body = await progressResponse.json();
            console.log(`✅ Progress API Loaded. Items: ${(body.sessions || []).length} sessions, ${(body.activityEvents || []).length} events`);
        } catch (e) { console.log('Error parsing progress JSON'); }

        console.log('Waiting for Progress UI...');
        await page.waitForSelector('[data-testid="activity-row"]', { timeout: 15000 });
        console.log('✅ Progress UI Visible');

        await page.screenshot({ path: path.join(proofDir, 'FINAL_progress_ui.png'), fullPage: true });

        console.log('✅ ALL PROOFS CAPTURED.');

    } catch (err) {
        console.error('❌ Automation Error:', err);
        await page.screenshot({ path: path.join(proofDir, 'FINAL_FAIL_ui.png'), fullPage: true });
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
