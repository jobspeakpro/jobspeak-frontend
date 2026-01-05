import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCREENSHOTS_DIR = path.join(__dirname, 'phase1_screenshots_production');
const PRODUCTION_URL = 'https://jobspeakpro.com';

// Test accounts (email = password)
const TEST_ACCOUNTS = [
    { email: 'mimito1030@gavrom.com', password: 'mimito1030@gavrom.com' },
    { email: 'meyefaf490@24faw.com', password: 'meyefaf490@24faw.com' }
];

// Create screenshots directory if it doesn't exist
try {
    mkdirSync(SCREENSHOTS_DIR, { recursive: true });
} catch (e) {
    // Directory might already exist
}

async function signIn(page, email, password) {
    console.log(`Signing in with: ${email}`);
    
    await page.goto(`${PRODUCTION_URL}/signin`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Check if already logged in
    const currentUrl = page.url();
    if (!currentUrl.includes('/signin') && !currentUrl.includes('/signup')) {
        console.log('Already logged in');
        return true;
    }
    
    // Fill in credentials
    try {
        const emailInput = await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
        await emailInput.fill(email);
        await page.waitForTimeout(500);
        
        const passwordInput = await page.$('input[type="password"], input[name="password"]');
        if (!passwordInput) throw new Error('No password input');
        await passwordInput.fill(password);
        await page.waitForTimeout(500);
        
        const submitButton = await page.$('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")');
        if (!submitButton) throw new Error('No submit button');
        
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
            submitButton.click()
        ]);
        
        await page.waitForTimeout(3000);
        
        const newUrl = page.url();
        if (!newUrl.includes('/signin') && !newUrl.includes('/signup')) {
            console.log('Sign-in successful');
            return true;
        }
    } catch (error) {
        console.log(`Sign-in error: ${error.message}`);
        return false;
    }
    
    return false;
}

async function findExistingSummary(page) {
    console.log('Searching for existing mock interview summaries...');
    
    // Try dashboard
    try {
        await page.goto(`${PRODUCTION_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        // Look for summary links
        const links = await page.$$eval('a[href*="mock-interview/summary"]', els => els.map(el => el.href));
        if (links.length > 0) {
            console.log(`Found ${links.length} existing summary link(s)`);
            return links[0];
        }
    } catch (e) {
        console.log('Could not check dashboard:', e.message);
    }
    
    // Try mock-interview page
    try {
        await page.goto(`${PRODUCTION_URL}/mock-interview`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        const links = await page.$$eval('a[href*="mock-interview/summary"]', els => els.map(el => el.href));
        if (links.length > 0) {
            console.log(`Found ${links.length} existing summary link(s) on mock-interview page`);
            return links[0];
        }
    } catch (e) {
        console.log('Could not check mock-interview page:', e.message);
    }
    
    return null;
}

async function startMockInterview(page) {
    console.log('Starting new mock interview...');
    
    // First ensure we're authenticated by checking dashboard
    await page.goto(`${PRODUCTION_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    let url = page.url();
    
    // If redirected to signin, we need to re-authenticate
    if (url.includes('/signin') || url.includes('/signup')) {
        throw new Error('Session expired - need to re-authenticate');
    }
    
    // Navigate directly to session
    await page.goto(`${PRODUCTION_URL}/mock-interview/session?type=short`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    url = page.url();
    if (url.includes('/mock-interview/session')) {
        console.log('Successfully on session page');
        return true;
    }
    
    if (url.includes('/mock-interview/summary')) {
        console.log('Already on summary page');
        return true;
    }
    
    // Try mock-interview page and click start
    await page.goto(`${PRODUCTION_URL}/mock-interview`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    url = page.url();
    if (url.includes('/signin') || url.includes('/signup')) {
        throw new Error('Not authenticated - cannot start interview');
    }
    
    // Find and click start button
    const startButton = await page.$('button:has-text("Start"), a:has-text("Start"), a[href*="session"]').catch(() => null);
    if (startButton) {
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
            startButton.click()
        ]);
        await page.waitForTimeout(3000);
        
        url = page.url();
        if (url.includes('/mock-interview/session') || url.includes('/mock-interview/summary')) {
            return true;
        }
    }
    
    return false;
}

async function answerQuestions(page) {
    console.log('Answering interview questions...');
    
    let questionNum = 0;
    const maxQuestions = 5; // Short interview typically has 5 questions
    
    while (questionNum < maxQuestions) {
        await page.waitForTimeout(2000);
        
        const url = page.url();
        if (url.includes('/mock-interview/summary')) {
            console.log('Reached summary page!');
            return true;
        }
        
        if (!url.includes('/mock-interview/session')) {
            console.log(`Unexpected URL: ${url}`);
            break;
        }
        
        questionNum++;
        console.log(`Answering question ${questionNum}...`);
        
        // Switch to type mode if available
        try {
            const typeButton = await page.$('button:has-text("Type")').catch(() => null);
            if (typeButton) {
                await typeButton.click();
                await page.waitForTimeout(1000);
            }
        } catch (e) {
            // Continue
        }
        
        // Find and fill answer input
        try {
            const answerInput = await page.$('textarea, input[type="text"], [contenteditable="true"]').catch(() => null);
            if (answerInput) {
                const sampleAnswer = `This is my answer to question ${questionNum}. I would approach this by considering the key factors and providing a thoughtful response.`;
                await answerInput.fill(sampleAnswer);
                await page.waitForTimeout(1000);
            }
        } catch (e) {
            console.log('Could not fill answer input');
        }
        
        // Submit
        try {
            const submitButton = await page.$('button:has-text("Submit"), button:has-text("Next"), button[type="submit"]').catch(() => null);
            if (submitButton) {
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
                    submitButton.click()
                ]);
                await page.waitForTimeout(3000);
            } else {
                console.log('No submit button found');
                break;
            }
        } catch (e) {
            console.log('Error submitting:', e.message);
            break;
        }
    }
    
    // Final check
    await page.waitForTimeout(3000);
    return page.url().includes('/mock-interview/summary');
}

async function captureScreenshots() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });

    try {
        console.log('\n=== CAPTURING PRODUCTION PHASE 1 SCREENSHOTS ===\n');
        console.log(`Target: ${PRODUCTION_URL}\n`);

        // DESKTOP
        console.log('=== DESKTOP SCREENSHOTS ===\n');
        const desktopPage = await context.newPage();
        await desktopPage.setViewportSize({ width: 1920, height: 1080 });

        // Authenticate
        let authenticated = false;
        let authEmail = null;
        let authAccount = null;
        
        for (const account of TEST_ACCOUNTS) {
            if (await signIn(desktopPage, account.email, account.password)) {
                authenticated = true;
                authEmail = account.email;
                authAccount = account;
                // Verify authentication by checking dashboard
                await desktopPage.goto(`${PRODUCTION_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await desktopPage.waitForTimeout(2000);
                const dashUrl = desktopPage.url();
                if (!dashUrl.includes('/signin') && !dashUrl.includes('/signup')) {
                    console.log(`Authenticated as: ${authEmail}\n`);
                    break;
                } else {
                    console.log(`Account ${account.email} may need verification, trying next...`);
                    authenticated = false;
                }
            }
        }
        
        if (!authenticated) {
            console.log('Test accounts failed, creating new account...');
            // Create new account using temp-mail
            const tempMailPage = await context.newPage();
            try {
                await tempMailPage.goto('https://temp-mail.org/en/', { waitUntil: 'domcontentloaded', timeout: 60000 });
                await tempMailPage.waitForTimeout(5000);
                
                // Get email
                const emailInput = await tempMailPage.$('#mail').catch(() => null);
                if (!emailInput) {
                    // Try alternative selector
                    const emailText = await tempMailPage.evaluate(() => {
                        const el = document.querySelector('#mail') || document.querySelector('[id*="mail"]') || document.querySelector('.mail');
                        return el?.value || el?.textContent || '';
                    });
                    if (emailText) {
                        authEmail = emailText.trim();
                    } else {
                        throw new Error('Could not get email from temp-mail');
                    }
                } else {
                    authEmail = await emailInput.inputValue();
                }
                
                if (!authEmail) {
                    throw new Error('Failed to get email from temp-mail');
                }
                
                console.log(`Generated email: ${authEmail}`);
                await tempMailPage.close();
                
                // Sign up
                await desktopPage.goto(`${PRODUCTION_URL}/signup`, { waitUntil: 'domcontentloaded', timeout: 30000 });
                await desktopPage.waitForTimeout(2000);
                
                const emailInputField = await desktopPage.$('input[type="email"], input[name="email"]');
                const passwordInputField = await desktopPage.$('input[type="password"], input[name="password"]');
                const submitBtn = await desktopPage.$('button[type="submit"], button:has-text("Sign Up")');
                
                if (emailInputField && passwordInputField && submitBtn) {
                    await emailInputField.fill(authEmail);
                    await passwordInputField.fill(authEmail); // email = password
                    await submitBtn.click();
                    await desktopPage.waitForTimeout(5000);
                    
                    // Check if we need to verify email - for now, try to sign in
                    const signInSuccess = await signIn(desktopPage, authEmail, authEmail);
                    if (signInSuccess) {
                        authenticated = true;
                        authAccount = { email: authEmail, password: authEmail };
                        console.log(`New account created and signed in: ${authEmail}`);
                    }
                }
            } catch (e) {
                await tempMailPage.close().catch(() => {});
                throw new Error(`Failed to create new account: ${e.message}`);
            }
        }
        
        if (!authenticated) {
            throw new Error('Failed to authenticate with any account');
        }

        // Find existing summary or start new interview
        let summaryUrl = await findExistingSummary(desktopPage);
        
        if (!summaryUrl) {
            console.log('No existing summary found, starting new interview...');
            const started = await startMockInterview(desktopPage);
            if (!started) {
                throw new Error('Failed to start mock interview');
            }
            
            // Answer questions
            const completed = await answerQuestions(desktopPage);
            if (!completed) {
                // Try to find summary after answering
                summaryUrl = await findExistingSummary(desktopPage);
                if (summaryUrl) {
                    await desktopPage.goto(summaryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                } else {
                    throw new Error('Failed to complete interview and reach summary');
                }
            } else {
                summaryUrl = desktopPage.url();
            }
        } else {
            console.log(`Using existing summary: ${summaryUrl}`);
            await desktopPage.goto(summaryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        }
        
        await desktopPage.waitForTimeout(5000);
        
        // Scroll to top
        await desktopPage.evaluate(() => window.scrollTo(0, 0));
        await desktopPage.waitForTimeout(2000);

        // 1. Summary Desktop
        console.log('Capturing: Mock Interview Summary (desktop)');
        await desktopPage.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'production_mock_interview_summary_desktop_full.png'),
            fullPage: true
        });

        // Scroll to Playback Settings
        await desktopPage.evaluate(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => 
                e.textContent?.includes('Playback Settings') || e.textContent?.includes('Play Sample')
            );
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        await desktopPage.waitForTimeout(2000);

        // 2. Play Sample Desktop
        console.log('Capturing: Play Sample UI (desktop)');
        const playbackEl = await desktopPage.evaluateHandle(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => 
                (e.textContent?.includes('Playback Settings') || e.textContent?.includes('Play Sample')) &&
                (e.textContent?.includes('Voice') || e.textContent?.includes('Speed'))
            );
            if (el) {
                let parent = el;
                for (let i = 0; i < 5; i++) {
                    if (parent && parent !== document.body) {
                        const cls = parent.className || '';
                        if (cls.includes('rounded') || cls.includes('border')) return parent;
                        parent = parent.parentElement;
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

        // Authenticate
        if (authAccount) {
            await signIn(mobilePage, authAccount.email, authAccount.password);
        } else if (authEmail) {
            await signIn(mobilePage, authEmail, authEmail);
        }

        // Navigate to summary
        await mobilePage.goto(summaryUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await mobilePage.waitForTimeout(5000);
        
        await mobilePage.evaluate(() => window.scrollTo(0, 0));
        await mobilePage.waitForTimeout(2000);

        // 3. Summary Mobile
        console.log('Capturing: Mock Interview Summary (mobile)');
        await mobilePage.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'production_mock_interview_summary_mobile_full.png'),
            fullPage: true
        });

        // Scroll to Playback Settings
        await mobilePage.evaluate(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => 
                e.textContent?.includes('Playback Settings') || e.textContent?.includes('Play Sample')
            );
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        await mobilePage.waitForTimeout(2000);

        // 4. Play Sample Mobile
        console.log('Capturing: Play Sample UI (mobile)');
        const mobilePlaybackEl = await mobilePage.evaluateHandle(() => {
            const el = Array.from(document.querySelectorAll('*')).find(e => 
                (e.textContent?.includes('Playback Settings') || e.textContent?.includes('Play Sample')) &&
                (e.textContent?.includes('Voice') || e.textContent?.includes('Speed'))
            );
            if (el) {
                let parent = el;
                for (let i = 0; i < 5; i++) {
                    if (parent && parent !== document.body) {
                        const cls = parent.className || '';
                        if (cls.includes('rounded') || cls.includes('border')) return parent;
                        parent = parent.parentElement;
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

        console.log('\n✅ All Production Phase 1 screenshots captured!');
        console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);
        
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
    } finally {
        await browser.close();
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
        console.error('Fatal error:', error);
        process.exit(1);
    });

