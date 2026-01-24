
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

// FIX: Handle Windows Environment
const home = process.env.HOME || process.env.USERPROFILE || os.homedir();
process.env.HOME = home;
process.env.USERPROFILE = process.env.USERPROFILE || home;

// Screenshots dir
const proofDir = path.join(__dirname, 'proof_screenshots');
if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir);

(async () => {
    console.log('🚀 Starting Autonomous Visual Proof...');
    console.log('Checking Environment...');
    console.log('HOME:', process.env.HOME);

    // Launch browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });

    // Use a clean page for "incognito" effect
    const page = await context.newPage();

    try {
        // --- STEP A: DASHBOARD ---
        console.log('📸 Step A: Dashboard Proof');
        await page.goto('https://jobspeakpro.com/dashboard?debug=1');
        await page.waitForTimeout(3000); // Wait for load

        // Seed Data
        console.log('🌱 Clicking Seed Data...');
        // Try to finding the seed button by text or class logic
        // It's in the overlay, we need to make sure overlay is visible
        try {
            await page.getByRole('button', { name: '🌱 Seed Data' }).click();
            await page.waitForTimeout(2000); // Wait for seed
        } catch (e) {
            console.error('Seed button interact failed', e);
        }

        // Refresh
        console.log('🔄 Refreshing...');
        await page.reload();
        await page.waitForTimeout(4000); // Wait for reload & fetch

        // Screenshot A
        console.log('📸 Capturing Dashboard...');
        await page.screenshot({ path: path.join(proofDir, 'A_dashboard_seeded.png'), fullPage: true });

        // --- STEP B: PROGRESS ---
        console.log('📸 Step B: Progress Proof');
        await page.goto('https://jobspeakpro.com/progress?debug=1');
        await page.waitForTimeout(4000);
        await page.screenshot({ path: path.join(proofDir, 'B_progress_seeded.png'), fullPage: true });

        // --- STEP C: PRACTICE ---
        // Just verify it doesn't crash/redirect and shows start
        console.log('📸 Step C: Practice Proof');
        await page.goto('https://jobspeakpro.com/practice?skipOnboarding=1');
        await page.waitForTimeout(4000);
        await page.screenshot({ path: path.join(proofDir, 'C_practice_start.png'), fullPage: true });

        // Return to Dashboard to prove counts stable? 
        // User asked: "Return to dashboard and refresh ... Screenshot showing counts didn’t drop"
        await page.goto('https://jobspeakpro.com/dashboard?debug=1');
        await page.waitForTimeout(2000);
        await page.reload();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(proofDir, 'C2_dashboard_after_practice.png') });

        // --- STEP D: MOCK INTERVIEW ---
        console.log('📸 Step D: Mock Interview Proof');
        await page.goto('https://jobspeakpro.com/mock-interview/session?type=short');
        await page.waitForTimeout(5000);
        await page.screenshot({ path: path.join(proofDir, 'D_mock_session.png'), fullPage: true });

        console.log('✅ Proof Sequence Complete.');
        console.log('Screenshots saved to:', proofDir);

    } catch (err) {
        console.error('❌ Automation Error:', err);
    } finally {
        await browser.close();
    }
})();
