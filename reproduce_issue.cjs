
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

// FIX: Handle Windows Environment
const home = process.env.HOME || process.env.USERPROFILE || os.homedir();
process.env.HOME = home;
process.env.USERPROFILE = process.env.USERPROFILE || home;

(async () => {
    console.log('🚀 Starting REPRODUCTION Script (Fresh User)...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // Capture Browser Logs
    page.on('console', msg => {
        console.log(`BROWSER LOG: ${msg.text()}`);
    });
    page.on('pageerror', err => console.log(`BROWSER CRASH: ${err.message}`));

    let postKey = null;
    let getKey = null;

    try {
        // 1. Visit Practice (Fresh)
        console.log('▶️ Step 1: Practice Start');

        const practiceStartPromise = page.waitForResponse(async resp => {
            if (resp.url().includes('/api/activity/start')) {
                const headers = await resp.request().allHeaders();
                postKey = headers['x-guest-key'];
                console.log(`📥 Captured POST Key: ${postKey}`);
                return true;
            }
            return false;
        });

        await page.goto('https://jobspeakpro.com/practice?skipOnboarding=1');
        await practiceStartPromise;

        // 2. Visit Dashboard
        console.log('▶️ Step 2: Navigate to Dashboard');

        const dashboardPromise = page.waitForResponse(async resp => {
            if (resp.url().includes('/api/dashboard/summary') || resp.url().includes('/api/progress')) {
                const headers = await resp.request().allHeaders();
                getKey = headers['x-guest-key'];
                console.log(`📤 Captured GET Key: ${getKey}`);

                try {
                    const body = await resp.json();
                    console.log('📄 GET Response Body Summary:', JSON.stringify(body).substring(0, 500));
                    console.log('   recentActivity Length:', body.recentActivity?.length);
                } catch (e) { console.log('   Could not parse JSON'); }

                return true;
            }
            return false;
        });

        await page.goto('https://jobspeakpro.com/dashboard?debug=1');
        await dashboardPromise;

        // 3. Compare
        console.log('\n--- ANALYSIS ---');
        console.log(`POST Key: ${postKey}`);
        console.log(`GET Key:  ${getKey}`);

        if (postKey !== getKey) {
            console.error('❌ FATAL: Guest Key CHANGED between requests!');
            console.error('This explains why data is missing.');
        } else {
            console.log('✅ Guest Key Persisted Correctly.');
            console.log('Checking UI...');
            try {
                await page.waitForSelector('[data-testid="activity-row"]', { timeout: 10000 });
                console.log('✅ UI shows activity rows.');
            } catch (e) {
                console.error('❌ UI is EMPTY despite matching keys (Backend Issue with Generated Keys?)');
                try {
                    const html = await page.content();
                    console.log('--- DOM DUMP ---');
                    console.log(html);
                    console.log('--- END DOM DUMP ---');
                } catch (domErr) { console.log('Error dumping DOM:', domErr); }
                await page.screenshot({ path: 'reproduce_failure_ui.png', fullPage: true });
            }
        }

    } catch (err) {
        console.error('❌ Automation Error:', err);
    } finally {
        await browser.close();
    }
})();
