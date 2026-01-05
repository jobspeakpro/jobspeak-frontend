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

try {
    mkdirSync(SCREENSHOTS_DIR, { recursive: true });
} catch (e) {}

async function signIn(page, email, password) {
    console.log(`Signing in: ${email}`);
    await page.goto(`${PRODUCTION_URL}/signin`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    if (!page.url().includes('/signin') && !page.url().includes('/signup')) {
        return true;
    }
    
    try {
        const emailInput = await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
        await emailInput.fill(email);
        await page.waitForTimeout(500);
        
        const passwordInput = await page.$('input[type="password"], input[name="password"]');
        await passwordInput.fill(password);
        await page.waitForTimeout(500);
        
        const submitButton = await page.$('button[type="submit"], button:has-text("Sign In")');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
            submitButton.click()
        ]);
        await page.waitForTimeout(3000);
        
        return !page.url().includes('/signin') && !page.url().includes('/signup');
    } catch (e) {
        return false;
    }
}

async function getTempEmail() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    try {
        await page.goto('https://temp-mail.org/en/', { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(5000);
        
        const email = await page.evaluate(() => {
            const input = document.querySelector('#mail');
            if (input) return input.value;
            const text = document.querySelector('[id*="mail"]') || document.querySelector('.mail');
            return text?.value || text?.textContent || '';
        });
        
        await browser.close();
        return email?.trim() || null;
    } catch (e) {
        await browser.close();
        return null;
    }
}

async function createAccount(page, email) {
    console.log(`Creating account: ${email}`);
    await page.goto(`${PRODUCTION_URL}/signup`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    try {
        const emailInput = await page.$('input[type="email"], input[name="email"]');
        const passwordInput = await page.$('input[type="password"], input[name="password"]');
        const submitButton = await page.$('button[type="submit"], button:has-text("Sign Up")');
        
        if (emailInput && passwordInput && submitButton) {
            await emailInput.fill(email);
            await passwordInput.fill(email);
            await submitButton.click();
            await page.waitForTimeout(5000);
            return true;
        }
    } catch (e) {
        console.log(`Account creation error: ${e.message}`);
    }
    return false;
}

async function findSummary(page) {
    try {
        await page.goto(`${PRODUCTION_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
        const links = await page.$$eval('a[href*="mock-interview/summary"]', els => els.map(el => el.href));
        return links.length > 0 ? links[0] : null;
    } catch (e) {
        return null;
    }
}

async function startInterview(page) {
    await page.goto(`${PRODUCTION_URL}/mock-interview/session?type=short`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/mock-interview/session')) return true;
    if (page.url().includes('/mock-interview/summary')) return true;
    
    await page.goto(`${PRODUCTION_URL}/mock-interview`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const startBtn = await page.$('button:has-text("Start"), a:has-text("Start"), a[href*="session"]');
    if (startBtn) {
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
            startBtn.click()
        ]);
        await page.waitForTimeout(3000);
    }
    
    return page.url().includes('/mock-interview/session') || page.url().includes('/mock-interview/summary');
}

async function answerQuestions(page) {
    for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(2000);
        if (page.url().includes('/mock-interview/summary')) return true;
        if (!page.url().includes('/mock-interview/session')) break;
        
        try {
            const typeBtn = await page.$('button:has-text("Type")');
            if (typeBtn) {
                await typeBtn.click();
                await page.waitForTimeout(1000);
            }
            
            const answerInput = await page.$('textarea, input[type="text"], [contenteditable="true"]');
            if (answerInput) {
                await answerInput.fill(`This is my answer to question ${i + 1}. I would provide a thoughtful response.`);
                await page.waitForTimeout(1000);
            }
            
            const submitBtn = await page.$('button:has-text("Submit"), button:has-text("Next"), button[type="submit"]');
            if (submitBtn) {
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
                    submitBtn.click()
                ]);
                await page.waitForTimeout(3000);
            } else {
                break;
            }
        } catch (e) {
            break;
        }
    }
    
    return page.url().includes('/mock-interview/summary');
}

async function captureScreenshots() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    
    try {
        console.log('\n=== CAPTURING PRODUCTION SCREENSHOTS ===\n');
        
        const desktopPage = await context.newPage();
        await desktopPage.setViewportSize({ width: 1920, height: 1080 });
        
        // Authenticate
        let authEmail = null;
        let authAccount = null;
        
        for (const account of TEST_ACCOUNTS) {
            if (await signIn(desktopPage, account.email, account.password)) {
                // Verify by checking dashboard
                await desktopPage.goto(`${PRODUCTION_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await desktopPage.waitForTimeout(2000);
                if (!desktopPage.url().includes('/signin') && !desktopPage.url().includes('/signup')) {
                    authEmail = account.email;
                    authAccount = account;
                    console.log(`Authenticated: ${authEmail}\n`);
                    break;
                }
            }
        }
        
        // If test accounts failed, create new one
        if (!authAccount) {
            console.log('Test accounts failed, creating new account...');
            const tempEmail = await getTempEmail();
            if (!tempEmail) {
                throw new Error('Failed to get temp email');
            }
            console.log(`Got email: ${tempEmail}`);
            
            if (await createAccount(desktopPage, tempEmail)) {
                await page.waitForTimeout(5000);
                if (await signIn(desktopPage, tempEmail, tempEmail)) {
                    authEmail = tempEmail;
                    authAccount = { email: tempEmail, password: tempEmail };
                    console.log(`New account created: ${tempEmail}`);
                }
            }
        }
        
        if (!authAccount) {
            throw new Error('Failed to authenticate');
        }
        
        // Find or create summary
        let summaryUrl = await findSummary(desktopPage);
        
        if (!summaryUrl) {
            console.log('Starting new interview...');
            if (await startInterview(desktopPage)) {
                if (await answerQuestions(desktopPage)) {
                    summaryUrl = desktopPage.url();
                } else {
                    summaryUrl = await findSummary(desktopPage);
                    if (summaryUrl) {
                        await desktopPage.goto(summaryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    } else {
                        throw new Error('Failed to reach summary');
                    }
                }
            } else {
                throw new Error('Failed to start interview');
            }
        } else {
            console.log(`Using existing summary: ${summaryUrl}`);
            await desktopPage.goto(summaryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        }
        
        await desktopPage.waitForTimeout(5000);
        await desktopPage.evaluate(() => window.scrollTo(0, 0));
        await desktopPage.waitForTimeout(2000);
        
        // Screenshot 1: Summary Desktop
        console.log('Capturing: Summary Desktop');
        await desktopPage.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'production_mock_interview_summary_desktop_full.png'),
            fullPage: true
        });
        
        // Screenshot 2: Play Sample Desktop
        await desktopPage.evaluate(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => 
                e.textContent?.includes('Playback Settings') || e.textContent?.includes('Play Sample')
            );
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        await desktopPage.waitForTimeout(2000);
        
        console.log('Capturing: Play Sample Desktop');
        const playbackEl = await desktopPage.evaluateHandle(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => 
                (e.textContent?.includes('Playback Settings') || e.textContent?.includes('Play Sample')) &&
                (e.textContent?.includes('Voice') || e.textContent?.includes('Speed'))
            );
            return el?.closest('div') || el || null;
        });
        
        if (playbackEl && playbackEl.asElement()) {
            await playbackEl.asElement().screenshot({
                path: path.join(SCREENSHOTS_DIR, 'production_play_sample_desktop.png')
            });
        } else {
            await desktopPage.screenshot({
                path: path.join(SCREENSHOTS_DIR, 'production_play_sample_desktop.png'),
                fullPage: false
            });
        }
        
        await desktopPage.close();
        
        // MOBILE
        console.log('\n=== MOBILE SCREENSHOTS ===\n');
        const mobilePage = await context.newPage();
        await mobilePage.setViewportSize({ width: 375, height: 667 });
        
        await signIn(mobilePage, authAccount.email, authAccount.password);
        await mobilePage.goto(summaryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await mobilePage.waitForTimeout(5000);
        await mobilePage.evaluate(() => window.scrollTo(0, 0));
        await mobilePage.waitForTimeout(2000);
        
        // Screenshot 3: Summary Mobile
        console.log('Capturing: Summary Mobile');
        await mobilePage.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'production_mock_interview_summary_mobile_full.png'),
            fullPage: true
        });
        
        // Screenshot 4: Play Sample Mobile
        await mobilePage.evaluate(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => 
                e.textContent?.includes('Playback Settings') || e.textContent?.includes('Play Sample')
            );
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        await mobilePage.waitForTimeout(2000);
        
        console.log('Capturing: Play Sample Mobile');
        const mobilePlaybackEl = await mobilePage.evaluateHandle(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => 
                (e.textContent?.includes('Playback Settings') || e.textContent?.includes('Play Sample')) &&
                (e.textContent?.includes('Voice') || e.textContent?.includes('Speed'))
            );
            return el?.closest('div') || el || null;
        });
        
        if (mobilePlaybackEl && mobilePlaybackEl.asElement()) {
            await mobilePlaybackEl.asElement().screenshot({
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

captureScreenshots()
    .then(result => {
        console.log('\n=== SCREENSHOT PATHS ===');
        result.files.forEach(file => {
            console.log(path.join(result.screenshotsDir, file));
        });
        process.exit(0);
    })
    .catch(error => {
        console.error('Fatal:', error);
        process.exit(1);
    });

