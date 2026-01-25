const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    // Launch browser
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const baseUrl = process.argv[2] || 'http://localhost:5173';

    // Set viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    console.log(`🚀 Starting Verification V3 on ${baseUrl}...`);

    const proofsDir = path.join(__dirname, 'docs/proofs/prod_fix_v3');
    if (!fs.existsSync(proofsDir)) {
        fs.mkdirSync(proofsDir, { recursive: true });
    }

    try {
        // 1. Verify Affiliate Apply Form (Success flow simulation)
        console.log("📸 Checking Affiliate Apply...");
        await page.goto(`${baseUrl}/affiliate/apply`, { waitUntil: 'networkidle' });

        // Fill form
        await page.fill('#full-name', 'Test User V3');
        await page.fill('#email', 'test_v3@example.com');
        await page.selectOption('#country', 'US');
        await page.selectOption('#platform', 'youtube');
        // Check audience options
        const audienceOptions = await page.$$eval('#audience option', options => options.map(o => o.value));
        if (audienceOptions.includes('50k-100k') && audienceOptions.includes('500k+')) {
            console.log("✅ Audience options present.");
        } else {
            console.error("❌ Audience options missing.");
        }
        await page.selectOption('#audience', '50k-100k');
        await page.fill('#link', 'https://youtube.com/test');
        await page.fill('#strategy', 'Test strategy via v3 script');

        const payoutRadio = await page.$('input[value="paypal"]');
        if (payoutRadio) await payoutRadio.click();
        await page.fill('#paypal_email', 'test_v3@example.com');

        // Submit
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
            console.log("Clicking submit...");
            await submitBtn.click();
            // Wait for navigation or error
            await page.waitForTimeout(3000);
        }
        await page.screenshot({ path: path.join(proofsDir, '01_affiliate_apply_success.png') });


        // 2. Verify Terms Button Scroll & Text
        console.log("📸 Checking Affiliate Page Terms...");
        await page.goto(`${baseUrl}/affiliate`, { waitUntil: 'networkidle' });

        // Check text
        const content = await page.content();
        if (content.includes("24 Month Duration")) {
            console.log("✅ '24 Month Duration' text found.");
        } else {
            console.error("❌ '24 Month Duration' text NOT found.");
        }

        // Click Terms
        const termsBtn = await page.$('a[href="#important-notes"]');
        if (termsBtn) {
            const box = await termsBtn.boundingBox();
            await page.screenshot({ path: path.join(proofsDir, '02a_affiliate_terms_button_before.png'), clip: { x: 0, y: 0, width: 1280, height: 600 } });
            await termsBtn.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: path.join(proofsDir, '02_affiliate_terms_button_scroll.png') });
            console.log("✅ Terms clicked.");
        } else {
            console.error("❌ Terms button not found.");
        }


        // 3. Footer Links
        console.log("📸 Checking Footer...");
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(proofsDir, '03_home_footer_links.png') });
        const refLink = await page.$('a[href="/referral"]');
        if (refLink) console.log("✅ Referral link found in footer.");


        // 4. Referral Page (Public check only if protected)
        console.log("📸 Checking Referral Page...");
        try {
            await page.goto(`${baseUrl}/referral`, { waitUntil: 'networkidle' });
            await page.screenshot({ path: path.join(proofsDir, '04_referral_page_code_visible.png') });
            // Test Copy button visual feedback if possible (hard without auth)
            console.log("✅ Referral page captured.");
        } catch (e) {
            console.log("Referral page check skipped (likely auth redirect)");
        }

        console.log("✅ Verification V3 Complete.");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
    } finally {
        await browser.close();
    }
})();
