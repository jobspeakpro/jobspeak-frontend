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
    try {
        await page.goto(`${PRODUCTION_URL}/signin`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        if (!page.url().includes('/signin') && !page.url().includes('/signup')) {
            return true;
        }
        
        const emailInput = await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
        await emailInput.fill(email);
        await page.waitForTimeout(500);
        
        const passwordInput = await page.$('input[type="password"], input[name="password"]');
        if (!passwordInput) return false;
        await passwordInput.fill(password);
        await page.waitForTimeout(500);
        
        const submitButton = await page.$('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")');
        if (!submitButton) return false;
        
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

async function findAnySummary(page) {
    const urls = [
        `${PRODUCTION_URL}/dashboard`,
        `${PRODUCTION_URL}/mock-interview`,
        `${PRODUCTION_URL}/progress`
    ];
    
    for (const url of urls) {
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await page.waitForTimeout(3000);
            
            // Look for summary links
            const links = await page.$$eval('a[href*="mock-interview/summary"]', els => els.map(el => el.href));
            if (links.length > 0) {
                return links[0];
            }
            
            // Also check if we're already on a summary page
            if (page.url().includes('/mock-interview/summary')) {
                return page.url();
            }
        } catch (e) {
            continue;
        }
    }
    return null;
}

async function startAndCompleteInterview(page) {
    console.log('Starting interview...');
    
    // Try direct navigation
    await page.goto(`${PRODUCTION_URL}/mock-interview/session?type=short`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/mock-interview/summary')) {
        return page.url();
    }
    
    if (!page.url().includes('/mock-interview/session')) {
        // Try mock-interview page
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
    }
    
    if (!page.url().includes('/mock-interview/session')) {
        return null;
    }
    
    // Answer questions
    console.log('Answering questions...');
    for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(2000);
        
        if (page.url().includes('/mock-interview/summary')) {
            return page.url();
        }
        
        if (!page.url().includes('/mock-interview/session')) {
            break;
        }
        
        try {
            // Switch to type mode
            const typeBtn = await page.$('button:has-text("Type")');
            if (typeBtn) {
                const classes = await typeBtn.getAttribute('class').catch(() => '');
                if (!classes.includes('active') && !classes.includes('selected')) {
                    await typeBtn.click();
                    await page.waitForTimeout(1000);
                }
            }
            
            // Fill answer
            const answerInput = await page.$('textarea, input[type="text"], [contenteditable="true"]');
            if (answerInput) {
                await answerInput.click();
                await page.waitForTimeout(500);
                await answerInput.fill('');
                await answerInput.type(`This is my comprehensive answer to question ${i + 1}. I would approach this systematically.`, { delay: 30 });
                await page.waitForTimeout(1000);
            }
            
            // Submit
            const submitBtn = await page.$('button:has-text("Submit"), button:has-text("Next"), button[type="submit"]');
            if (submitBtn) {
                const isDisabled = await submitBtn.isDisabled().catch(() => false);
                if (!isDisabled) {
                    await Promise.all([
                        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
                        submitBtn.click()
                    ]);
                    await page.waitForTimeout(3000);
                } else {
                    break;
                }
            } else {
                break;
            }
        } catch (e) {
            console.log(`Question ${i + 1} error: ${e.message}`);
            break;
        }
    }
    
    await page.waitForTimeout(3000);
    if (page.url().includes('/mock-interview/summary')) {
        return page.url();
    }
    
    // Try to find summary after completion
    return await findAnySummary(page);
}

async function captureScreenshots() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    
    try {
        console.log('\n=== CAPTURING PRODUCTION SCREENSHOTS ===\n');
        
        const desktopPage = await context.newPage();
        await desktopPage.setViewportSize({ width: 1920, height: 1080 });
        
        // Try authentication with test accounts
        let authAccount = null;
        let summaryUrl = null;
        
        for (const account of TEST_ACCOUNTS) {
            console.log(`Trying account: ${account.email}`);
            if (await signIn(desktopPage, account.email, account.password)) {
                await desktopPage.waitForTimeout(3000);
                
                // Try multiple navigation approaches
                const testUrls = [
                    `${PRODUCTION_URL}/mock-interview`,
                    `${PRODUCTION_URL}/mock-interview/session?type=short`,
                    `${PRODUCTION_URL}/dashboard`
                ];
                
                let canAccess = false;
                for (const testUrl of testUrls) {
                    await desktopPage.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    await desktopPage.waitForTimeout(2000);
                    
                    const currentUrl = desktopPage.url();
                    if (!currentUrl.includes('/signin') && !currentUrl.includes('/signup')) {
                        canAccess = true;
                        authAccount = account;
                        console.log(`✓ Authenticated: ${account.email} (via ${testUrl})\n`);
                        break;
                    }
                }
                
                if (canAccess) {
                    // Look for existing summary
                    summaryUrl = await findAnySummary(desktopPage);
                    if (summaryUrl) {
                        console.log(`Found existing summary: ${summaryUrl}`);
                        break;
                    }
                    
                    // Try to start and complete interview
                    summaryUrl = await startAndCompleteInterview(desktopPage);
                    if (summaryUrl) {
                        console.log(`Completed interview, summary: ${summaryUrl}`);
                        break;
                    }
                } else {
                    console.log(`Account ${account.email} cannot access protected pages (may need verification)`);
                }
            }
        }
        
        // If test accounts failed, create new account with temp-mail
        if (!summaryUrl && !authAccount) {
            console.log('\nTest accounts failed, creating new account with temp-mail...');
            let email = null;
            
            // Use same browser context for temp-mail
            const tempPage = await context.newPage();
            
            try {
                console.log('Loading temp-mail.org...');
                await tempPage.goto('https://temp-mail.org/en/', { waitUntil: 'domcontentloaded', timeout: 120000 });
                await tempPage.waitForTimeout(10000);
                
                // Try to get email with multiple methods
                email = await tempPage.evaluate(() => {
                    // Method 1: Direct selector
                    const mailInput = document.querySelector('#mail');
                    if (mailInput) {
                        const val = mailInput.value || mailInput.getAttribute('value');
                        if (val && val.includes('@')) return val;
                    }
                    
                    // Method 2: Look for input with email pattern
                    const inputs = Array.from(document.querySelectorAll('input'));
                    for (const input of inputs) {
                        const val = input.value || '';
                        if (val.includes('@') && val.includes('.')) {
                            return val;
                        }
                    }
                    
                    // Method 3: Look in text content
                    const bodyText = document.body.innerText || document.body.textContent || '';
                    const emailMatch = bodyText.match(/[\w.-]+@[\w.-]+\.\w+/);
                    if (emailMatch && emailMatch[0].includes('@')) {
                        return emailMatch[0];
                    }
                    
                    return null;
                });
                
                // If still no email, wait more and try again
                if (!email || !email.includes('@')) {
                    console.log('Email not found, waiting longer...');
                    await tempPage.waitForTimeout(5000);
                    email = await tempPage.evaluate(() => {
                        const mailInput = document.querySelector('#mail');
                        return mailInput?.value || null;
                    });
                }
                
                // Keep tempPage open for email verification check later
                
                if (email && email.includes('@')) {
                    console.log(`✓ Got email: ${email}`);
                    
                    // Sign up
                    console.log('Creating account...');
                    await desktopPage.goto(`${PRODUCTION_URL}/signup`, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    await desktopPage.waitForTimeout(2000);
                    
                    const emailInput = await desktopPage.$('input[type="email"], input[name="email"]');
                    const passwordInput = await desktopPage.$('input[type="password"], input[name="password"]');
                    const submitBtn = await desktopPage.$('button[type="submit"], button:has-text("Sign Up")');
                    
                    if (emailInput && passwordInput && submitBtn) {
                        await emailInput.fill(email);
                        await passwordInput.fill(email);
                        await submitBtn.click();
                        await desktopPage.waitForTimeout(3000);
                        
                        console.log('Account created, waiting for verification email (20 seconds)...');
                        await desktopPage.waitForTimeout(20000);
                        
                        // Check temp-mail for verification email - try multiple times
                        let verificationLink = null;
                        for (let attempt = 0; attempt < 3; attempt++) {
                            try {
                                console.log(`Checking email (attempt ${attempt + 1}/3)...`);
                                await tempPage.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
                                await tempPage.waitForTimeout(5000);
                                
                                // Try to find and click first email
                                const firstEmail = await tempPage.$('li:first-child, div[class*="mail"]:first-child, [class*="message"]:first-child');
                                if (firstEmail) {
                                    await firstEmail.click();
                                    await tempPage.waitForTimeout(5000);
                                }
                                
                                // Extract verification link
                                verificationLink = await tempPage.evaluate(() => {
                                    // Method 1: Look for links with jobspeak/verify/confirm
                                    const links = Array.from(document.querySelectorAll('a[href]'));
                                    for (const link of links) {
                                        const href = link.href || '';
                                        if (href.includes('jobspeakpro.com') || href.includes('verify') || href.includes('confirm')) {
                                            return href;
                                        }
                                    }
                                    
                                    // Method 2: Look in all text content
                                    const allText = document.body.innerText || document.body.textContent || '';
                                    const urlPattern = /https?:\/\/[^\s<>"']+(?:verify|confirm|jobspeak)[^\s<>"']*/gi;
                                    const matches = allText.match(urlPattern);
                                    if (matches && matches.length > 0) {
                                        return matches[0];
                                    }
                                    
                                    // Method 3: Look for any URL pattern
                                    const anyUrl = /https?:\/\/[^\s<>"']+/gi;
                                    const urlMatches = allText.match(anyUrl);
                                    if (urlMatches) {
                                        for (const url of urlMatches) {
                                            if (url.includes('jobspeak')) {
                                                return url;
                                            }
                                        }
                                    }
                                    
                                    return null;
                                });
                                
                                if (verificationLink) {
                                    console.log(`✓ Found verification link: ${verificationLink.substring(0, 80)}...`);
                                    break;
                                }
                                
                                await tempPage.waitForTimeout(5000);
                            } catch (e) {
                                console.log(`Email check attempt ${attempt + 1} error: ${e.message}`);
                            }
                        }
                        
                        if (verificationLink) {
                            console.log('Navigating to verification link...');
                            await desktopPage.goto(verificationLink, { waitUntil: 'domcontentloaded', timeout: 30000 });
                            await desktopPage.waitForTimeout(5000);
                        }
                        
                        await tempPage.close();
                        
                        // Try to sign in (even if verification link wasn't found, some sites allow immediate access)
                        console.log('Attempting sign in...');
                        if (await signIn(desktopPage, email, email)) {
                            authAccount = { email, password: email };
                            console.log(`✓ Signed in: ${email}`);
                            
                            await desktopPage.waitForTimeout(3000);
                            
                            // Try direct access to mock interview (may work even without full verification)
                            console.log('Trying direct access to mock interview...');
                            await desktopPage.goto(`${PRODUCTION_URL}/mock-interview/session?type=short`, { waitUntil: 'domcontentloaded', timeout: 30000 });
                            await desktopPage.waitForTimeout(3000);
                            
                            if (desktopPage.url().includes('/mock-interview/session') || desktopPage.url().includes('/mock-interview/summary')) {
                                console.log('✓ Can access mock interview directly!');
                                if (desktopPage.url().includes('/mock-interview/summary')) {
                                    summaryUrl = desktopPage.url();
                                } else {
                                    summaryUrl = await startAndCompleteInterview(desktopPage);
                                }
                            } else {
                                // Try to find or create summary
                                console.log('Looking for summary...');
                                summaryUrl = await findAnySummary(desktopPage);
                                if (!summaryUrl) {
                                    console.log('No existing summary, starting interview...');
                                    summaryUrl = await startAndCompleteInterview(desktopPage);
                                }
                            }
                        } else {
                            console.log('Sign in failed - account may need email verification');
                            // Try one more time with longer wait
                            await desktopPage.waitForTimeout(5000);
                            if (await signIn(desktopPage, email, email)) {
                                authAccount = { email, password: email };
                                summaryUrl = await findAnySummary(desktopPage) || await startAndCompleteInterview(desktopPage);
                            }
                        }
                    }
                } else {
                    await tempPage.close();
                    console.log('Failed to get email from temp-mail');
                }
            } catch (e) {
                await tempPage.close().catch(() => {});
                console.log(`Temp-mail error: ${e.message}`);
            }
        }
        
        if (!summaryUrl) {
            throw new Error('Failed to find or create summary page');
        }
        
        // Navigate to summary
        await desktopPage.goto(summaryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
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
            const all = Array.from(document.querySelectorAll('*'));
            const el = all.find(e => {
                const text = e.textContent || '';
                return (text.includes('Playback Settings') || text.includes('Play Sample')) &&
                       (text.includes('Voice') || text.includes('Speed') || text.includes('Sample'));
            });
            if (el) {
                let p = el;
                for (let i = 0; i < 5; i++) {
                    if (p && p !== document.body) {
                        const cls = p.className || '';
                        if (cls.includes('rounded') || cls.includes('border') || cls.includes('bg-')) {
                            return p;
                        }
                        p = p.parentElement;
                    }
                }
                return el.closest('div') || el;
            }
            return null;
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
        
        if (authAccount) {
            await signIn(mobilePage, authAccount.email, authAccount.password);
        }
        
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
            const all = Array.from(document.querySelectorAll('*'));
            const el = all.find(e => {
                const text = e.textContent || '';
                return (text.includes('Playback Settings') || text.includes('Play Sample')) &&
                       (text.includes('Voice') || text.includes('Speed') || text.includes('Sample'));
            });
            if (el) {
                let p = el;
                for (let i = 0; i < 5; i++) {
                    if (p && p !== document.body) {
                        const cls = p.className || '';
                        if (cls.includes('rounded') || cls.includes('border') || cls.includes('bg-')) {
                            return p;
                        }
                        p = p.parentElement;
                    }
                }
                return el.closest('div') || el;
            }
            return null;
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
        
        console.log('\n✅ All screenshots captured!');
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

