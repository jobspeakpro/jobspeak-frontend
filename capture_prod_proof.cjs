const { chromium } = require('playwright');

(async () => {
    console.log('Launching browser...');
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();

        // 1. Capture Signup
        console.log('Navigating to Production Signup...');
        await page.goto('https://jobspeakpro.com/signup');
        await page.waitForSelector('input', { timeout: 10000 });
        // Verify optional label
        const optionalLabel = await page.textContent('body');
        if (optionalLabel.includes('Invite Code (Optional)')) {
            console.log('Verified: Invite Code is Optional');
        } else {
            console.error('Failed: Invite Code Optional label not found');
        }
        await page.screenshot({ path: 'prod_signup_proof.png' });
        console.log('Captured prod_signup_proof.png');

        // 2. Capture Practice & TTS
        console.log('Navigating to Production Practice...');
        await page.goto('https://jobspeakpro.com/practice');
        await page.waitForSelector('button:has-text("Sample")', { timeout: 10000 });

        // Open dropdown (if applicable) or just click sample
        // We want to verify TTS dropdown interaction. 
        // Assuming standard selects or custom dropdown.
        // Let's take a screenshot of the initial state.
        await page.screenshot({ path: 'prod_practice_initial.png' });

        // 3. Mock Interview Summary (Manager Thought)
        // This requires a full flow. We'll try to reach it.
        console.log('Starting Mock Interview...');
        await page.goto('https://jobspeakpro.com/mock-interview');

        try {
            // Quick run through provided we can bypass/interact
            // If gate exists, this might fail, but deployment should have fixed it or we are logged in?
            // Wait, we are incognito, so we might hit the gate if not signed in?
            // The previous subagent signed up. This script is fresh.
            // We probably need to sign in found in previous step or just check public accessible pages.
            // Actually, the user wants "What the manager thought". This is on the practice summary or session summary.
            // Practice page IS accessible without login (free attempts).
            // Let's do a practice session (PracticeSpeakingPage) which is at /practice.

            await page.goto('https://jobspeakpro.com/practice');
            // Type answer
            await page.fill('textarea', 'This is a test answer for verification.');
            // Click fix/submit
            await page.click('button:has-text("Fix my answer")');

            // Wait for result
            await page.waitForSelector('text=What the manager thought', { timeout: 20000 });
            await page.screenshot({ path: 'prod_manager_thought.png' });
            console.log('Captured prod_manager_thought.png');
        } catch (e) {
            console.log('Could not complete practice flow:', e.message);
            await page.screenshot({ path: 'prod_practice_error.png' });
        }

        await browser.close();
        console.log('Done.');
    } catch (e) {
        console.error('Script failed:', e);
        process.exit(1);
    }
})();
