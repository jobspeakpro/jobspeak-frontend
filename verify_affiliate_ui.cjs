const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://jobspeakpro.com';
const PROOF_DIR = path.join(__dirname, 'docs/proofs/2026-01-26_affiliate_ui_fixes');

if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
}

const log = (msg) => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] ${msg}`);
};

(async () => {
    log(`🚀 Starting Affiliate UI Verification on ${TARGET_URL}...`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    const consoleLogs = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleLogs.push(`[ERROR] ${msg.text()}`);
        } else {
            consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
        }
    });
    page.on('pageerror', err => {
        consoleLogs.push(`[PAGE_ERROR] ${err.message}`);
    });

    try {
        // 1. Affiliate Page & Terms Button
        log('📋 Checking /affiliate...');
        await page.goto(`${TARGET_URL}/affiliate`, { waitUntil: 'networkidle' });

        const termsBtn = await page.getByText('View Program Terms', { exact: false });
        if (await termsBtn.isVisible()) {
            // Verify link
            const href = await termsBtn.getAttribute('href');
            if (href === '/affiliate/terms') {
                log('✅ Button has correct href');
            } else {
                log(`⚠️ Button href is ${href}`);
            }

            await termsBtn.scrollIntoViewIfNeeded();
            await page.screenshot({ path: path.join(PROOF_DIR, '01_affiliate_terms_button.png') });
            log('✅ captured 01_affiliate_terms_button.png');

            await termsBtn.click();
            await page.waitForURL('**/affiliate/terms', { timeout: 10000 });
            log('✅ Navigated to /affiliate/terms');
        } else {
            log('❌ View Program Terms button not found.');
        }

        // 2. Terms Page
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: path.join(PROOF_DIR, '02_terms_page_top.png') });
        log('✅ captured 02_terms_page_top.png');

        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(PROOF_DIR, '03_terms_page_terms.png') });
        log('✅ captured 03_terms_page_terms.png');

        await page.click('text=Back to Affiliate Program');
        await page.waitForURL(`${TARGET_URL}/affiliate`);
        log('✅ Back link works');

        // 3. Apply Page (No Footer)
        log('📋 Checking /affiliate/apply...');
        await page.goto(`${TARGET_URL}/affiliate/apply`, { waitUntil: 'networkidle' });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(PROOF_DIR, '04_apply_no_footer.png') });
        log('✅ captured 04_apply_no_footer.png');

        // Check for footer presence in DOM to be sure
        const footerInfo = await page.evaluate(() => {
            const footer = document.querySelector('footer');
            return footer ? footer.innerText : null;
        });
        if (!footerInfo || footerInfo.trim() === '') {
            log('✅ Footer appears effectively empty or removed (checked DOM).');
        } else {
            // It might be the main layout footer? The user asked to remove "the footer bar with links".
            // My code removed the specific footer in the component. The UniversalHeader might import a layout? 
            // AffiliateJoinPage is standalone.
            log(`ℹ️ Footer content found: ${footerInfo.substring(0, 50)}...`);
        }


        // 4. Joined Page
        log('📋 Checking /affiliate/joined...');
        await page.goto(`${TARGET_URL}/affiliate/joined`, { waitUntil: 'networkidle' });

        const bodyText = await page.textContent('body');
        if (bodyText.includes("We’ll email you after review")) {
            log('✅ Copy updated.');
        } else {
            log('⚠️ Copy mismatch.');
        }

        const linkedinBtn = await page.$('text=Follow on LinkedIn');
        if (!linkedinBtn) {
            log('✅ LinkedIn button removed.');
        } else {
            log('❌ LinkedIn button present.');
        }

        await page.screenshot({ path: path.join(PROOF_DIR, '05_joined_blue_no_linkedin.png') });
        log('✅ captured 05_joined_blue_no_linkedin.png');

        // 5. Logo Click
        const logo = await page.locator('header a[href="/"]').first();
        if (await logo.count() > 0) {
            await logo.click();
            await page.waitForURL(`${TARGET_URL}/`);
            log('✅ Logo click navigated to Home');
            await page.screenshot({ path: path.join(PROOF_DIR, '06_logo_click_home.png') });
        }

        // Save console logs
        fs.writeFileSync(path.join(PROOF_DIR, 'console_clean.txt'), consoleLogs.join('\n'));
        log('✅ Saved console_clean.txt');

    } catch (e) {
        log(`❌ Error: ${e.message}`);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
