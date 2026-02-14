const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    console.log('Launching browser for debug...');
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();

        console.log('Navigating to Production Practice...');
        await page.goto('https://jobspeakpro.com/practice');
        // Wait for hydration
        await page.waitForTimeout(5000);

        // Dump HTML
        const content = await page.content();
        fs.writeFileSync('prod_practice.html', content);
        console.log('Dumped HTML to prod_practice.html');

        // Screenshot
        await page.screenshot({ path: 'prod_practice_debug.png' });
        console.log('Captured prod_practice_debug.png');

        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
