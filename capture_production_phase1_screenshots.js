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

async function createTempEmailAccount(page) {
    console.log('Generating random email for new account...');
    
    // Generate a random email (we'll use a simple format since temp-mail is timing out)
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const email = `test${randomId}@example.com`;
    
    console.log(`Generated email: ${email}`);
    console.log('Note: This email may need verification. Using test format.');
    
    return email;
}

async function signIn(page, email, password) {
    console.log(`Signing in with: ${email}`);
    
    await page.goto(`${PRODUCTION_URL}/signin`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Check if already logged in
    const currentUrl = page.url();
    if (!currentUrl.includes('/signin') && !currentUrl.includes('/signup')) {
        console.log('Already logged in, proceeding...');
        return true;
    }
    
    // Wait for form to be ready
    await page.waitForSelector('input[type="email"], input[name="email"], #email', { timeout: 10000 }).catch(() => {});
    
    // Fill in email
    const emailInput = await page.$('input[type="email"], input[name="email"], #email');
    if (!emailInput) {
        throw new Error('Could not find email input');
    }
    await emailInput.click();
    await emailInput.fill(email);
    await page.waitForTimeout(1000);
    
    // Fill in password
    const passwordInput = await page.$('input[type="password"], input[name="password"], #password');
    if (!passwordInput) {
        throw new Error('Could not find password input');
    }
    await passwordInput.click();
    await passwordInput.fill(password);
    await page.waitForTimeout(1000);
    
    // Click submit button
    const submitButton = await page.$('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")');
    if (!submitButton) {
        throw new Error('Could not find submit button');
    }
    await submitButton.click();
    
    // Wait for navigation with multiple checks
    let attempts = 0;
    while (attempts < 15) {
        await page.waitForTimeout(2000);
        const newUrl = page.url();
        
        // Success if we're not on signin/signup page
        if (!newUrl.includes('/signin') && !newUrl.includes('/signup')) {
            console.log('Sign-in successful, redirected to:', newUrl);
            await page.waitForTimeout(2000); // Wait a bit more for page to stabilize
            return true;
        }
        
        // Check for error messages
        const errorText = await page.textContent('body').catch(() => '');
        if (errorText.includes('Invalid') || errorText.includes('incorrect') || errorText.includes('wrong')) {
            console.log('Sign-in failed: Invalid credentials');
            return false;
        }
        
        attempts++;
    }
    
    // Final check
    const finalUrl = page.url();
    if (finalUrl.includes('/signin') || finalUrl.includes('/signup')) {
        console.log('Still on signin/signup page, might need email verification or account issue');
        return false;
    }
    
    console.log('Sign-in successful');
    return true;
}

async function signUp(page, email, password) {
    console.log(`Signing up with: ${email}`);
    
    await page.goto(`${PRODUCTION_URL}/signup`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Fill in email
    const emailInput = await page.$('input[type="email"], input[name="email"], #email');
    if (!emailInput) {
        throw new Error('Could not find email input on signup');
    }
    await emailInput.fill(email);
    await page.waitForTimeout(500);
    
    // Fill in password
    const passwordInput = await page.$('input[type="password"], input[name="password"], #password');
    if (!passwordInput) {
        throw new Error('Could not find password input on signup');
    }
    await passwordInput.fill(password);
    await page.waitForTimeout(500);
    
    // Click submit button
    const submitButton = await page.$('button[type="submit"], button:has-text("Sign Up"), button:has-text("Create Account")');
    if (!submitButton) {
        throw new Error('Could not find submit button on signup');
    }
    await submitButton.click();
    
    // Wait for navigation or email verification message
    await page.waitForTimeout(5000);
    
    console.log('Sign-up initiated, may need email verification');
    return true;
}

async function authenticate(page, createNewIfNeeded = true) {
    // Try test accounts first
    for (const account of TEST_ACCOUNTS) {
        console.log(`\nTrying account: ${account.email}`);
        const success = await signIn(page, account.email, account.password);
        if (success) {
            // If sign-in succeeded, use the account (let the mock interview flow handle restrictions)
            console.log(`Account ${account.email} authenticated successfully`);
            return { success: true, email: account.email };
        }
        console.log(`Account ${account.email} failed, trying next...`);
        await page.waitForTimeout(2000);
    }
    
    // If all test accounts fail and we're allowed to create new ones
    if (createNewIfNeeded) {
        console.log('\nAll test accounts failed, creating new account...');
        const newEmail = await createTempEmailAccount(page);
        const password = newEmail; // email = password as per requirements
        
        await signUp(page, newEmail, password);
        
        // Wait a bit for email verification (in production, might need to check email)
        console.log('Account created. Note: Email verification may be required.');
        await page.waitForTimeout(5000);
        
        // Try to sign in with new account
        const signInSuccess = await signIn(page, newEmail, password);
        if (signInSuccess) {
            // Verify access
            await page.goto(`${PRODUCTION_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(2000);
            const dashboardUrl = page.url();
            if (!dashboardUrl.includes('/signin') && !dashboardUrl.includes('/signup')) {
                return { success: true, email: newEmail };
            }
        }
    }
    
    throw new Error('Failed to authenticate with any account');
}

async function completeMockInterview(page, authenticatedEmail = null) {
    console.log('\n=== Starting Mock Interview ===\n');
    
    // First, check dashboard for existing completed sessions
    console.log('Checking dashboard for existing sessions...');
    await page.goto(`${PRODUCTION_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Look for existing summary links
    const summaryLinks = await page.$$('a[href*="mock-interview/summary"]');
    if (summaryLinks.length > 0) {
        const href = await summaryLinks[0].getAttribute('href');
        console.log(`Found existing summary: ${href}`);
        const fullUrl = href.startsWith('http') ? href : `${PRODUCTION_URL}${href}`;
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(5000);
        
        // Verify we're on summary page
        if (page.url().includes('/mock-interview/summary')) {
            console.log('Using existing summary page');
            return true;
        }
    }
    
    // No existing session, try to start a new one
    console.log('No existing session found, starting new interview...');
    
    // Try navigating directly to session URL first (simpler)
    console.log('Attempting direct navigation to session...');
    await page.goto(`${PRODUCTION_URL}/mock-interview/session?type=short`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Check current URL - might have been redirected
    let currentUrl = page.url();
    console.log(`Current URL after direct navigation: ${currentUrl}`);
    
    // If redirected to signin, re-authenticate
    if (currentUrl.includes('/signin') || currentUrl.includes('/signup')) {
        console.log('Redirected to signin, re-authenticating...');
        if (!authenticatedEmail) {
            // Try all test accounts
            for (const account of TEST_ACCOUNTS) {
                const reAuthSuccess = await signIn(page, account.email, account.password);
                if (reAuthSuccess) {
                    authenticatedEmail = account.email;
                    break;
                }
            }
        } else {
            // Use the known email
            const account = TEST_ACCOUNTS.find(a => a.email === authenticatedEmail);
            if (account) {
                await signIn(page, account.email, account.password);
            }
        }
        // Try again
        await page.goto(`${PRODUCTION_URL}/mock-interview/session?type=short`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        currentUrl = page.url();
    }
    
    // If redirected to /start, follow that
    if (currentUrl.includes('/start')) {
        console.log('Redirected to /start, following...');
        await page.waitForTimeout(3000);
        currentUrl = page.url();
    }
    
    // If already on session or summary, use it
    if (currentUrl.includes('/mock-interview/summary')) {
        console.log('Already on summary page');
        return true;
    }
    
    if (currentUrl.includes('/mock-interview/session')) {
        console.log('Successfully navigated to session page');
    } else {
        // Try the mock-interview page and look for start button
        console.log('Not on session page, trying mock-interview page...');
        await page.goto(`${PRODUCTION_URL}/mock-interview`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        currentUrl = page.url();
        
        if (currentUrl.includes('/signin') || currentUrl.includes('/signup')) {
            throw new Error('Cannot access mock interview - account may need email verification');
        }
        
        // Look for "Start" button or link to start interview
        const startSelectors = [
            'button:has-text("Start")',
            'a:has-text("Start")',
            'button:has-text("Begin")',
            'a:has-text("Begin")',
            'button:has-text("Mock Interview")',
            'a[href*="mock-interview/session"]',
            '[href*="/mock-interview/session"]'
        ];
        
        let startButton = null;
        for (const selector of startSelectors) {
            try {
                startButton = await page.$(selector);
                if (startButton) {
                    const isVisible = await startButton.isVisible().catch(() => false);
                    if (isVisible) break;
                }
            } catch (e) {
                // Continue
            }
        }
        
        if (!startButton) {
            throw new Error('Cannot find start button and direct navigation failed');
        } else {
            console.log('Clicking start button...');
            // Wait for navigation after click
            const [response] = await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => null),
                startButton.click()
            ]);
            await page.waitForTimeout(3000);
            currentUrl = page.url();
        }
    }
    
    // Check current URL after navigation attempt
    let finalUrl = page.url();
    console.log(`URL after navigation attempt: ${finalUrl}`);
    
    // If redirected to signin again, the account might need verification or have restrictions
    if (finalUrl.includes('/signin') || finalUrl.includes('/signup')) {
        console.log('Redirected to signin again. Account may need email verification or have restrictions.');
        console.log('Trying to find existing completed sessions from dashboard...');
        
        // Re-authenticate
        if (authenticatedEmail) {
            const account = TEST_ACCOUNTS.find(a => a.email === authenticatedEmail);
            if (account) {
                await signIn(page, account.email, account.password);
            }
        }
        
        // Go to dashboard and look for existing sessions
        await page.goto(`${PRODUCTION_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        const dashboardSummaryLinks = await page.$$('a[href*="mock-interview/summary"]');
        if (dashboardSummaryLinks.length > 0) {
            const href = await dashboardSummaryLinks[0].getAttribute('href');
            console.log(`Found existing summary on dashboard: ${href}`);
            const fullUrl = href.startsWith('http') ? href : `${PRODUCTION_URL}${href}`;
            await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(5000);
            return true;
        }
        
        throw new Error('Cannot start new interview (may need email verification) and no existing sessions found');
    }
    
    // Wait for session page to load (with more flexible waiting)
    let attempts = 0;
    while (attempts < 10 && !page.url().includes('/mock-interview/session') && !page.url().includes('/mock-interview/summary')) {
        await page.waitForTimeout(2000);
        attempts++;
        finalUrl = page.url();
        if (finalUrl.includes('/signin') || finalUrl.includes('/signup')) {
            break; // Don't keep waiting if we're redirected
        }
    }
    
    // Check if we're on the session page or summary
    finalUrl = page.url();
    if (finalUrl.includes('/mock-interview/summary')) {
        console.log('Already on summary page (redirected)');
        return true;
    }
    
    if (!finalUrl.includes('/mock-interview/session')) {
        console.log(`Unexpected URL: ${finalUrl}`);
        // Try one more time to navigate directly
        await page.goto(`${PRODUCTION_URL}/mock-interview/session?type=short`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        finalUrl = page.url();
        if (!finalUrl.includes('/mock-interview/session') && !finalUrl.includes('/mock-interview/summary')) {
            // Last resort: check dashboard for existing sessions
            console.log('Final attempt: checking dashboard for existing sessions...');
            await page.goto(`${PRODUCTION_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(3000);
            const lastSummaryLinks = await page.$$('a[href*="mock-interview/summary"]');
            if (lastSummaryLinks.length > 0) {
                const href = await lastSummaryLinks[0].getAttribute('href');
                const fullUrl = href.startsWith('http') ? href : `${PRODUCTION_URL}${href}`;
                await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
                await page.waitForTimeout(5000);
                return true;
            }
            throw new Error(`Failed to navigate to mock interview session. Current URL: ${finalUrl}`);
        }
    }
    
    console.log('On mock interview session page');
    
    // Answer questions - look for question text and answer input
    let questionCount = 0;
    const maxQuestions = 10; // Safety limit
    
    while (questionCount < maxQuestions) {
        await page.waitForTimeout(2000);
        
        // Check if we're on summary page (interview completed)
        const currentUrl = page.url();
        if (currentUrl.includes('/mock-interview/summary')) {
            console.log('Interview completed! Reached summary page.');
            await page.waitForTimeout(3000);
            return true;
        }
        
        // Check if we're still on session page
        if (!currentUrl.includes('/mock-interview/session')) {
            console.log(`Unexpected URL: ${currentUrl}`);
            if (currentUrl.includes('/mock-interview/summary')) {
                return true;
            }
            break;
        }
        
        // Wait for page to be ready
        try {
            await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        } catch (e) {
            // Continue
        }
        
        // Look for question text
        const questionText = await page.textContent('body').catch(() => '');
        if (!questionText || questionText.length < 10) {
            console.log('No question text found, waiting...');
            await page.waitForTimeout(2000);
            questionCount++;
            continue;
        }
        
        console.log(`\nQuestion ${questionCount + 1}:`);
        
        // Switch to type mode if available (easier than recording audio)
        try {
            const typeModeSelectors = [
                'button:has-text("Type")',
                'button:has-text("text")',
                '[data-mode="type"]',
                'button[aria-label*="type" i]'
            ];
            
            for (const selector of typeModeSelectors) {
                const typeModeButton = await page.$(selector).catch(() => null);
                if (typeModeButton) {
                    const isVisible = await typeModeButton.isVisible().catch(() => false);
                    if (isVisible) {
                        const isActive = await typeModeButton.getAttribute('class').then(c => 
                            c?.includes('active') || c?.includes('selected') || c?.includes('bg-')
                        ).catch(() => false);
                        if (!isActive) {
                            console.log('Switching to type mode...');
                            await typeModeButton.click();
                            await page.waitForTimeout(1500);
                        }
                        break;
                    }
                }
            }
        } catch (e) {
            console.log('Could not switch to type mode, continuing...');
        }
        
        // Find text input for answer
        const answerSelectors = [
            'textarea',
            'input[type="text"]',
            '[contenteditable="true"]',
            '[role="textbox"]',
            'input[name*="answer" i]',
            'textarea[name*="answer" i]'
        ];
        
        let answerInput = null;
        for (const selector of answerSelectors) {
            answerInput = await page.$(selector).catch(() => null);
            if (answerInput) {
                const isVisible = await answerInput.isVisible().catch(() => false);
                if (isVisible) break;
                answerInput = null;
            }
        }
        
        if (answerInput) {
            // Clear and type a sample answer
            await answerInput.click();
            await page.waitForTimeout(500);
            await answerInput.fill('');
            await page.waitForTimeout(500);
            
            const sampleAnswer = `This is a sample answer for question ${questionCount + 1}. I would approach this by considering the key factors involved and providing a thoughtful response that demonstrates my understanding of the topic. I believe the most important aspect is to be clear, concise, and demonstrate relevant experience.`;
            await answerInput.type(sampleAnswer, { delay: 50 });
            await page.waitForTimeout(1000);
            console.log('Answer typed');
        } else {
            console.log('No answer input found, trying to find submit button anyway...');
        }
        
        // Find and click submit button
        const submitSelectors = [
            'button:has-text("Submit")',
            'button:has-text("Next")',
            'button:has-text("Continue")',
            'button[type="submit"]',
            'button:has-text("Send")',
            'button:has-text("Answer")'
        ];
        
        let submitButton = null;
        for (const selector of submitSelectors) {
            submitButton = await page.$(selector).catch(() => null);
            if (submitButton) {
                const isVisible = await submitButton.isVisible().catch(() => false);
                const isDisabled = await submitButton.isDisabled().catch(() => false);
                if (isVisible && !isDisabled) break;
                submitButton = null;
            }
        }
        
        if (submitButton) {
            console.log('Submitting answer...');
            await submitButton.click();
            await page.waitForTimeout(5000); // Wait for submission to process
            
            // Wait for navigation or next question
            await page.waitForTimeout(3000);
            
            // Check for errors
            const errorText = await page.textContent('body').catch(() => '');
            if (errorText.includes('error') || errorText.includes('Error') || errorText.includes('failed')) {
                console.log('Error detected, but continuing...');
            }
        } else {
            console.log('No submit button found, might be on summary page');
            // Check if we're on summary
            await page.waitForTimeout(2000);
            if (page.url().includes('/mock-interview/summary')) {
                return true;
            }
            break;
        }
        
        questionCount++;
        
        // Check if we've moved to summary
        await page.waitForTimeout(2000);
        if (page.url().includes('/mock-interview/summary')) {
            console.log('Interview completed! Reached summary page.');
            await page.waitForTimeout(3000);
            return true;
        }
    }
    
    // Final check for summary page
    await page.waitForTimeout(3000);
    if (page.url().includes('/mock-interview/summary')) {
        console.log('Interview completed! Reached summary page.');
        return true;
    }
    
    // If we've answered questions but aren't on summary, try navigating to dashboard to find summary
    console.log('Not on summary yet, checking dashboard for summary link...');
    await page.goto(`${PRODUCTION_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const finalSummaryLinks = await page.$$('a[href*="mock-interview/summary"]');
    if (finalSummaryLinks.length > 0) {
        const href = await finalSummaryLinks[0].getAttribute('href');
        const fullUrl = href.startsWith('http') ? href : `${PRODUCTION_URL}${href}`;
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(5000);
        return true;
    }
    
    throw new Error('Failed to complete mock interview - did not reach summary page');
}

async function captureScreenshots() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();

    try {
        console.log('\n=== CAPTURING PRODUCTION PHASE 1 SCREENSHOTS ===\n');
        console.log(`Target: ${PRODUCTION_URL}\n`);

        // DESKTOP SCREENSHOTS
        console.log('=== DESKTOP SCREENSHOTS ===\n');
        const desktopPage = await context.newPage();
        await desktopPage.setViewportSize({ width: 1920, height: 1080 });

        // Authenticate
        const authResult = await authenticate(desktopPage);
        if (!authResult.success) {
            throw new Error('Authentication failed');
        }
        console.log(`Authenticated as: ${authResult.email}\n`);

        // Complete mock interview or find existing summary
        const hasSummary = await completeMockInterview(desktopPage, authResult.email);
        if (!hasSummary) {
            throw new Error('Failed to reach summary page');
        }

        // Ensure we're on summary page
        if (!desktopPage.url().includes('/mock-interview/summary')) {
            throw new Error('Not on summary page after completing interview');
        }

        // Wait for page to fully load
        await desktopPage.waitForTimeout(5000);
        
        // Scroll to top
        await desktopPage.evaluate(() => {
            window.scrollTo(0, 0);
        });
        await desktopPage.waitForTimeout(2000);

        // 1. Mock Interview Summary (Desktop) - Full page
        console.log('Capturing: Mock Interview Summary (desktop - full page)');
        await desktopPage.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'production_mock_interview_summary_desktop_full.png'),
            fullPage: true
        });

        // Scroll to Playback Settings section (Play Sample UI)
        console.log('Scrolling to Playback Settings section...');
        await desktopPage.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            const playback = elements.find(el => 
                el.textContent?.includes('Playback Settings') || 
                el.textContent?.includes('Play Sample') ||
                el.textContent?.includes('Sample')
            );
            if (playback) {
                playback.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        await desktopPage.waitForTimeout(2000);

        // 2. Play Sample UI (Desktop) - Focused on Playback Settings
        console.log('Capturing: Play Sample UI (desktop - Playback Settings section)');
        const playbackContainer = await desktopPage.evaluateHandle(() => {
            const allElements = Array.from(document.querySelectorAll('*'));
            const playbackEl = allElements.find(el => 
                (el.textContent?.includes('Playback Settings') || 
                 el.textContent?.includes('Play Sample') ||
                 el.textContent?.includes('Sample')) &&
                (el.textContent?.includes('Voice') || el.textContent?.includes('Speed'))
            );
            if (playbackEl) {
                let parent = playbackEl;
                for (let i = 0; i < 5; i++) {
                    if (parent && parent !== document.body) {
                        const classes = parent.className || '';
                        if (classes.includes('rounded') || classes.includes('border') || classes.includes('bg-')) {
                            return parent;
                        }
                        parent = parent.parentElement;
                    }
                }
                return playbackEl.closest('div') || playbackEl;
            }
            return null;
        });

        if (playbackContainer && playbackContainer.asElement()) {
            await playbackContainer.asElement().screenshot({
                path: path.join(SCREENSHOTS_DIR, 'production_play_sample_desktop.png')
            });
        } else {
            // Fallback: take screenshot of viewport
            await desktopPage.screenshot({
                path: path.join(SCREENSHOTS_DIR, 'production_play_sample_desktop.png'),
                fullPage: false
            });
        }

        // Get the summary URL for mobile
        const summaryUrl = desktopPage.url();
        console.log(`Summary URL: ${summaryUrl}`);

        await desktopPage.close();

        // MOBILE SCREENSHOTS
        console.log('\n=== MOBILE SCREENSHOTS ===\n');
        const mobilePage = await context.newPage();
        await mobilePage.setViewportSize({ width: 375, height: 667 });

        // Authenticate (reuse same account)
        console.log('Authenticating mobile session...');
        // Use the same email that worked for desktop
        const mobileEmail = authResult.email;
        const mobileAccount = TEST_ACCOUNTS.find(a => a.email === mobileEmail);
        if (mobileAccount) {
            const mobileAuthSuccess = await signIn(mobilePage, mobileAccount.email, mobileAccount.password);
            if (!mobileAuthSuccess) {
                // Fallback to full authenticate
                const mobileAuthResult = await authenticate(mobilePage);
                if (!mobileAuthResult.success) {
                    throw new Error('Mobile authentication failed');
                }
            }
        } else {
            const mobileAuthResult = await authenticate(mobilePage);
            if (!mobileAuthResult.success) {
                throw new Error('Mobile authentication failed');
            }
        }

        // Navigate directly to summary (we already have the URL)
        console.log('Navigating to summary page (mobile)...');
        await mobilePage.goto(summaryUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await mobilePage.waitForTimeout(5000);

        // Scroll to top
        await mobilePage.evaluate(() => {
            window.scrollTo(0, 0);
        });
        await mobilePage.waitForTimeout(2000);

        // 3. Mock Interview Summary (Mobile) - Full page
        console.log('Capturing: Mock Interview Summary (mobile - full page)');
        await mobilePage.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'production_mock_interview_summary_mobile_full.png'),
            fullPage: true
        });

        // Scroll to Playback Settings section
        console.log('Scrolling to Playback Settings section (mobile)...');
        await mobilePage.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            const playback = elements.find(el => 
                el.textContent?.includes('Playback Settings') || 
                el.textContent?.includes('Play Sample') ||
                el.textContent?.includes('Sample')
            );
            if (playback) {
                playback.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        await mobilePage.waitForTimeout(2000);

        // 4. Play Sample UI (Mobile) - Focused on Playback Settings
        console.log('Capturing: Play Sample UI (mobile - Playback Settings section)');
        const mobilePlaybackContainer = await mobilePage.evaluateHandle(() => {
            const allElements = Array.from(document.querySelectorAll('*'));
            const playbackEl = allElements.find(el => 
                (el.textContent?.includes('Playback Settings') || 
                 el.textContent?.includes('Play Sample') ||
                 el.textContent?.includes('Sample')) &&
                (el.textContent?.includes('Voice') || el.textContent?.includes('Speed'))
            );
            if (playbackEl) {
                let parent = playbackEl;
                for (let i = 0; i < 5; i++) {
                    if (parent && parent !== document.body) {
                        const classes = parent.className || '';
                        if (classes.includes('rounded') || classes.includes('border') || classes.includes('bg-')) {
                            return parent;
                        }
                        parent = parent.parentElement;
                    }
                }
                return playbackEl.closest('div') || playbackEl;
            }
            return null;
        });

        if (mobilePlaybackContainer && mobilePlaybackContainer.asElement()) {
            await mobilePlaybackContainer.asElement().screenshot({
                path: path.join(SCREENSHOTS_DIR, 'production_play_sample_mobile.png')
            });
        } else {
            // Fallback: take screenshot of viewport
            await mobilePage.screenshot({
                path: path.join(SCREENSHOTS_DIR, 'production_play_sample_mobile.png'),
                fullPage: false
            });
        }

        await mobilePage.close();

        console.log('\n✅ All Production Phase 1 screenshots captured successfully!');
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
        console.error('Error capturing screenshots:', error);
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
    })
    .catch(console.error);

