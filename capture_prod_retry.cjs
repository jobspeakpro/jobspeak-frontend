const { chromium } = require('playwright');

(async () => {
    console.log('Launching browser for retry...');
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();

        // 1. Capture Practice Page State
        console.log('Navigating to Production Practice...');
        await page.goto('https://jobspeakpro.com/practice');
        // Wait a bit for hydration
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'prod_practice_state.png' });
        console.log('Captured prod_practice_state.png');

        // 2. Mock Interview Summary
        console.log('Starting Mock Interview flow...');
        await page.goto('https://jobspeakpro.com/mock-interview');
        await page.waitForTimeout(3000);

        // Check if gate is present
        const gate = await page.$('text=Unlock');
        if (gate) {
            console.log('Hit Paywall Gate on Mock Interview. Cannot proceed to summary without login/pro.');
            await page.screenshot({ path: 'prod_mock_gate.png' });
        } else {
            console.log('Attempting to run interview...');
            // Try to perform one answer if possible
            const textarea = await page.$('textarea');
            if (textarea) {
                await page.fill('textarea', 'Test answer for verification.');
                await page.click('button:has-text("Submit")');
                await page.waitForTimeout(2000);
                await page.screenshot({ path: 'prod_mock_interaction.png' });
            } else {
                await page.screenshot({ path: 'prod_mock_initial.png' });
            }
        }

        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
