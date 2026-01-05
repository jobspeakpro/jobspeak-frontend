import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCREENSHOTS_DIR = path.join(__dirname, 'phase1_screenshots_production');
const PRODUCTION_URL = 'https://jobspeakpro.com';

const TEST_ACCOUNTS = [
    { email: 'mimito1030@gavrom.com', password: 'mimito1030@gavrom.com' },
    { email: 'meyefaf490@24faw.com', password: 'meyefaf490@24faw.com' }
];

try { mkdirSync(SCREENSHOTS_DIR, { recursive: true }); } catch (e) {}

async function signIn(page, email, password) {
    try {
        await page.goto(`${PRODUCTION_URL}/signin`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        if (!page.url().includes('/signin')) return true;
        
        await page.fill('input[type="email"], input[name="email"]', email);
        await page.fill('input[type="password"], input[name="password"]', password);
        await page.click('button[type="submit"], button:has-text("Sign In")');
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
        await page.waitForTimeout(3000);
        return !page.url().includes('/signin') && !page.url().includes('/signup');
    } catch (e) {
        return false;
    }
}

async function getTempEmail(context) {
    const page = await context.newPage();
    try {
        await page.goto('https://temp-mail.org/en/', { waitUntil: 'networkidle', timeout: 120000 });
        await page.waitForTimeout(10000);
        const email = await page.evaluate(() => {
            return document.querySelector('#mail')?.value || 
                   Array.from(document.querySelectorAll('input')).find(i => i.value?.includes('@'))?.value || '';
        });
        return email?.trim() || null;
    } catch (e) {
        return null;
    } finally {
        // Keep page open for email checking
    }
}

async function createAndVerifyAccount(mainPage, tempPage, email) {
    await mainPage.goto(`${PRODUCTION_URL}/signup`, { waitUntil: 'networkidle', timeout: 30000 });
    await mainPage.waitForTimeout(2000);
    await mainPage.fill('input[type="email"]', email);
    await mainPage.fill('input[type="password"]', email);
    await mainPage.click('button[type="submit"]');
    await mainPage.waitForTimeout(3000);
    
    // Wait for verification email
    console.log('Waiting for verification email...');
    for (let i = 0; i < 6; i++) {
        await tempPage.reload({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
        await tempPage.waitForTimeout(5000);
        const link = await tempPage.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href]'));
            for (const a of links) {
                if (a.href.includes('jobspeakpro.com')) return a.href;
            }
            const text = document.body.innerText || '';
            const match = text.match(/https?:\/\/[^\s]+jobspeakpro[^\s]*/i);
            return match ? match[0] : null;
        });
        if (link) {
            await mainPage.goto(link, { waitUntil: 'networkidle', timeout: 30000 });
            await mainPage.waitForTimeout(3000);
            return true;
        }
    }
    return false;
}

async function findOrCreateSummary(page) {
    // Try to find existing
    await page.goto(`${PRODUCTION_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    const links = await page.$$eval('a[href*="summary"]', els => els.map(e => e.href));
    if (links.length > 0) return links[0];
    
    // Start new interview
    await page.goto(`${PRODUCTION_URL}/mock-interview/session?type=short`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/summary')) return page.url();
    if (!page.url().includes('/session')) return null;
    
    // Answer questions
    for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(2000);
        if (page.url().includes('/summary')) return page.url();
        
        const typeBtn = await page.$('button:has-text("Type")');
        if (typeBtn) await typeBtn.click();
        await page.waitForTimeout(1000);
        
        const input = await page.$('textarea, [contenteditable="true"]');
        if (input) await input.fill(`Answer ${i + 1}: This is my response.`);
        await page.waitForTimeout(1000);
        
        const submit = await page.$('button:has-text("Submit"), button:has-text("Next")');
        if (submit) {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {}),
                submit.click()
            ]);
            await page.waitForTimeout(3000);
        }
    }
    
    return page.url().includes('/summary') ? page.url() : null;
}

async function main() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    
    try {
        const page = await context.newPage();
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        // Try test accounts
        let summaryUrl = null;
        let authAccount = null;
        
        for (const account of TEST_ACCOUNTS) {
            if (await signIn(page, account.email, account.password)) {
                summaryUrl = await findOrCreateSummary(page);
                if (summaryUrl) {
                    authAccount = account;
                    break;
                }
            }
        }
        
        // Create new account if needed
        if (!summaryUrl) {
            console.log('Creating new account...');
            const tempPage = await context.newPage();
            const email = await getTempEmail(context);
            if (email) {
                if (await createAndVerifyAccount(page, tempPage, email)) {
                    if (await signIn(page, email, email)) {
                        authAccount = { email, password: email };
                        summaryUrl = await findOrCreateSummary(page);
                    }
                }
                await tempPage.close();
            }
        }
        
        if (!summaryUrl) throw new Error('Failed to get summary');
        
        // Capture screenshots
        await page.goto(summaryUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(5000);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(2000);
        
        await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'production_mock_interview_summary_desktop_full.png'),
            fullPage: true
        });
        
        await page.evaluate(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => 
                e.textContent?.includes('Playback Settings'));
            if (el) el.scrollIntoView({ block: 'center' });
        });
        await page.waitForTimeout(2000);
        
        const playback = await page.evaluateHandle(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => 
                e.textContent?.includes('Playback Settings') && e.textContent?.includes('Sample'));
            return el?.closest('div') || el;
        });
        
        if (playback?.asElement()) {
            await playback.asElement().screenshot({
                path: path.join(SCREENSHOTS_DIR, 'production_play_sample_desktop.png')
            });
        } else {
            await page.screenshot({
                path: path.join(SCREENSHOTS_DIR, 'production_play_sample_desktop.png'),
                fullPage: false
            });
        }
        
        // Mobile
        const mobilePage = await context.newPage();
        await mobilePage.setViewportSize({ width: 375, height: 667 });
        if (authAccount) await signIn(mobilePage, authAccount.email, authAccount.password);
        await mobilePage.goto(summaryUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await mobilePage.waitForTimeout(5000);
        await mobilePage.evaluate(() => window.scrollTo(0, 0));
        await mobilePage.waitForTimeout(2000);
        
        await mobilePage.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'production_mock_interview_summary_mobile_full.png'),
            fullPage: true
        });
        
        await mobilePage.evaluate(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => 
                e.textContent?.includes('Playback Settings'));
            if (el) el.scrollIntoView({ block: 'center' });
        });
        await mobilePage.waitForTimeout(2000);
        
        const mobilePlayback = await mobilePage.evaluateHandle(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => 
                e.textContent?.includes('Playback Settings') && e.textContent?.includes('Sample'));
            return el?.closest('div') || el;
        });
        
        if (mobilePlayback?.asElement()) {
            await mobilePlayback.asElement().screenshot({
                path: path.join(SCREENSHOTS_DIR, 'production_play_sample_mobile.png')
            });
        } else {
            await mobilePage.screenshot({
                path: path.join(SCREENSHOTS_DIR, 'production_play_sample_mobile.png'),
                fullPage: false
            });
        }
        
        await mobilePage.close();
        await browser.close();
        
        console.log('\n✅ Screenshots captured!');
        return {
            screenshotsDir: SCREENSHOTS_DIR,
            files: [
                'production_mock_interview_summary_desktop_full.png',
                'production_play_sample_desktop.png',
                'production_mock_interview_summary_mobile_full.png',
                'production_play_sample_mobile.png'
            ]
        };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

main()
    .then(result => {
        console.log('\n=== PATHS ===');
        result.files.forEach(f => console.log(path.join(result.screenshotsDir, f)));
        process.exit(0);
    })
    .catch(e => {
        console.error('Fatal:', e);
        process.exit(1);
    });

