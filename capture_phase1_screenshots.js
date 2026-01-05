import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCREENSHOTS_DIR = path.join(__dirname, 'phase1_screenshots');
const CREDENTIALS = {
    email: 'test_audio_20250109_1@guerrillamail.com',
    password: 'TestAudio123!'
};

// Create screenshots directory if it doesn't exist
import { mkdirSync } from 'fs';
try {
    mkdirSync(SCREENSHOTS_DIR, { recursive: true });
} catch (e) {
    // Directory might already exist
}

async function captureScreenshots() {
    const browser = await chromium.launch({ headless: false }); // Use headless: false to see what's happening
    const context = await browser.newContext();

    try {
        console.log('\n=== CAPTURING PHASE 1 SCREENSHOTS ===\n');

        // DESKTOP SCREENSHOTS
        console.log('=== DESKTOP SCREENSHOTS ===\n');
        const desktopPage = await context.newPage();
        await desktopPage.setViewportSize({ width: 1920, height: 1080 });

        // Login
        console.log('Logging in (desktop)...');
        await desktopPage.goto('http://localhost:5173/signin', { waitUntil: 'networkidle', timeout: 30000 });
        await desktopPage.waitForTimeout(2000);
        
        // Check if already logged in
        const currentUrl = desktopPage.url();
        if (!currentUrl.includes('/signin')) {
            console.log('Already logged in, proceeding...');
        } else {
            await desktopPage.fill('input[type="email"], #email', CREDENTIALS.email);
            await desktopPage.fill('input[type="password"], #password', CREDENTIALS.password);
            await desktopPage.click('button[type="submit"]');
            await desktopPage.waitForTimeout(3000);
        }

        // Navigate to dashboard to find a mock interview session
        console.log('Navigating to dashboard...');
        await desktopPage.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
        await desktopPage.waitForTimeout(3000);

        // Try to find a mock interview session link and click it
        // Look for links that contain "mock-interview/summary"
        const summaryLinks = await desktopPage.$$('a[href*="mock-interview/summary"]');
        
        let summaryUrl = null;
        if (summaryLinks.length > 0) {
            summaryUrl = await summaryLinks[0].getAttribute('href');
            console.log(`Found mock interview summary link: ${summaryUrl}`);
        } else {
            // If no link found, try to extract session ID from page or use a test ID
            console.log('No summary link found, checking for session data...');
            // Try to start a new mock interview session first
            const startButton = await desktopPage.$('button:has-text("Start"), a:has-text("Mock Interview")');
            if (startButton) {
                await startButton.click();
                await desktopPage.waitForTimeout(5000);
                // After starting, we might be redirected to summary
                const currentUrl2 = desktopPage.url();
                if (currentUrl2.includes('/mock-interview/summary/')) {
                    summaryUrl = currentUrl2;
                }
            }
        }

        // If we still don't have a URL, try a test session ID
        if (!summaryUrl) {
            console.log('Using test session ID...');
            summaryUrl = '/mock-interview/summary/test-session-123';
        }

        // Navigate to mock interview summary
        console.log(`Navigating to: ${summaryUrl}`);
        const fullUrl = summaryUrl.startsWith('http') ? summaryUrl : `http://localhost:5173${summaryUrl}`;
        await desktopPage.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await desktopPage.waitForTimeout(5000); // Wait for content to load

        // Scroll to ensure all content is visible
        await desktopPage.evaluate(() => {
            window.scrollTo(0, 0);
        });
        await desktopPage.waitForTimeout(1000);

        // 1. Mock Interview Summary (Desktop) - Full page
        console.log('Capturing: Mock Interview Summary (desktop - full page)');
        await desktopPage.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'before_mock_interview_summary_desktop_full.png'),
            fullPage: true
        });

        // Scroll to Playback Settings section (Play Sample UI)
        console.log('Scrolling to Playback Settings section...');
        // Try multiple selectors to find the Playback Settings section
        let playbackSection = null;
        const selectors = [
            'h4:has-text("Playback Settings")',
            'text=Playback Settings',
            '[class*="Playback"]',
            'div:has-text("Playback Settings")'
        ];
        
        for (const selector of selectors) {
            try {
                playbackSection = await desktopPage.$(selector);
                if (playbackSection) break;
            } catch (e) {
                // Continue to next selector
            }
        }
        
        if (playbackSection) {
            await playbackSection.scrollIntoViewIfNeeded();
            await desktopPage.waitForTimeout(1500);
        } else {
            // Scroll down to find it
            await desktopPage.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                const playback = elements.find(el => el.textContent?.includes('Playback Settings'));
                if (playback) playback.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            await desktopPage.waitForTimeout(1500);
        }

        // 2. Play Sample UI (Desktop) - Focused on Playback Settings
        console.log('Capturing: Play Sample UI (desktop - Playback Settings section)');
        // Try to find the container with Playback Settings and Sample button
        const playbackContainer = await desktopPage.evaluateHandle(() => {
            // Find element containing "Playback Settings"
            const allElements = Array.from(document.querySelectorAll('*'));
            const playbackEl = allElements.find(el => 
                el.textContent?.includes('Playback Settings') && 
                el.textContent?.includes('Sample')
            );
            if (playbackEl) {
                // Find parent container
                let parent = playbackEl;
                while (parent && parent !== document.body) {
                    if (parent.classList?.contains('rounded-xl') || 
                        parent.classList?.contains('border') ||
                        parent.getAttribute('class')?.includes('bg-blue')) {
                        return parent;
                    }
                    parent = parent.parentElement;
                }
                return playbackEl.closest('div[class*="rounded"]') || playbackEl;
            }
            return null;
        });

        if (playbackContainer && playbackContainer.asElement()) {
            await playbackContainer.asElement().screenshot({
                path: path.join(SCREENSHOTS_DIR, 'before_play_sample_desktop.png')
            });
        } else {
            // Fallback: take screenshot of viewport centered on Playback Settings
            await desktopPage.screenshot({
                path: path.join(SCREENSHOTS_DIR, 'before_play_sample_desktop.png'),
                fullPage: false // Viewport only to focus on the section
            });
        }

        await desktopPage.close();

        // MOBILE SCREENSHOTS
        console.log('\n=== MOBILE SCREENSHOTS ===\n');
        const mobilePage = await context.newPage();
        await mobilePage.setViewportSize({ width: 375, height: 667 });

        // Login
        console.log('Logging in (mobile)...');
        await mobilePage.goto('http://localhost:5173/signin', { waitUntil: 'networkidle', timeout: 30000 });
        await mobilePage.waitForTimeout(2000);
        
        // Check if already logged in
        const mobileCurrentUrl = mobilePage.url();
        if (!mobileCurrentUrl.includes('/signin')) {
            console.log('Already logged in, proceeding...');
        } else {
            await mobilePage.fill('input[type="email"], #email', CREDENTIALS.email);
            await mobilePage.fill('input[type="password"], #password', CREDENTIALS.password);
            await mobilePage.click('button[type="submit"]');
            await mobilePage.waitForTimeout(3000);
        }

        // Navigate to dashboard
        console.log('Navigating to dashboard (mobile)...');
        await mobilePage.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
        await mobilePage.waitForTimeout(3000);

        // Find mock interview summary link
        const mobileSummaryLinks = await mobilePage.$$('a[href*="mock-interview/summary"]');
        
        let mobileSummaryUrl = summaryUrl; // Reuse from desktop
        if (mobileSummaryLinks.length > 0) {
            mobileSummaryUrl = await mobileSummaryLinks[0].getAttribute('href');
            console.log(`Found mock interview summary link: ${mobileSummaryUrl}`);
        }

        // Navigate to mock interview summary
        console.log(`Navigating to: ${mobileSummaryUrl}`);
        const mobileFullUrl = mobileSummaryUrl.startsWith('http') ? mobileSummaryUrl : `http://localhost:5173${mobileSummaryUrl}`;
        await mobilePage.goto(mobileFullUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await mobilePage.waitForTimeout(5000);

        // Scroll to top
        await mobilePage.evaluate(() => {
            window.scrollTo(0, 0);
        });
        await mobilePage.waitForTimeout(1000);

        // 3. Mock Interview Summary (Mobile) - Full page
        console.log('Capturing: Mock Interview Summary (mobile - full page)');
        await mobilePage.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'before_mock_interview_summary_mobile_full.png'),
            fullPage: true
        });

        // Scroll to Playback Settings section
        console.log('Scrolling to Playback Settings section (mobile)...');
        // Try multiple selectors to find the Playback Settings section
        let mobilePlaybackSection = null;
        const mobileSelectors = [
            'h4:has-text("Playback Settings")',
            'text=Playback Settings',
            '[class*="Playback"]',
            'div:has-text("Playback Settings")'
        ];
        
        for (const selector of mobileSelectors) {
            try {
                mobilePlaybackSection = await mobilePage.$(selector);
                if (mobilePlaybackSection) break;
            } catch (e) {
                // Continue to next selector
            }
        }
        
        if (mobilePlaybackSection) {
            await mobilePlaybackSection.scrollIntoViewIfNeeded();
            await mobilePage.waitForTimeout(1500);
        } else {
            // Scroll down to find it
            await mobilePage.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                const playback = elements.find(el => el.textContent?.includes('Playback Settings'));
                if (playback) playback.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            await mobilePage.waitForTimeout(1500);
        }

        // 4. Play Sample UI (Mobile) - Focused on Playback Settings
        console.log('Capturing: Play Sample UI (mobile - Playback Settings section)');
        const mobilePlaybackContainer = await mobilePage.evaluateHandle(() => {
            // Find element containing "Playback Settings"
            const allElements = Array.from(document.querySelectorAll('*'));
            const playbackEl = allElements.find(el => 
                el.textContent?.includes('Playback Settings') && 
                el.textContent?.includes('Sample')
            );
            if (playbackEl) {
                // Find parent container
                let parent = playbackEl;
                while (parent && parent !== document.body) {
                    if (parent.classList?.contains('rounded-xl') || 
                        parent.classList?.contains('border') ||
                        parent.getAttribute('class')?.includes('bg-blue')) {
                        return parent;
                    }
                    parent = parent.parentElement;
                }
                return playbackEl.closest('div[class*="rounded"]') || playbackEl;
            }
            return null;
        });

        if (mobilePlaybackContainer && mobilePlaybackContainer.asElement()) {
            await mobilePlaybackContainer.asElement().screenshot({
                path: path.join(SCREENSHOTS_DIR, 'before_play_sample_mobile.png')
            });
        } else {
            // Fallback: take screenshot of viewport
            await mobilePage.screenshot({
                path: path.join(SCREENSHOTS_DIR, 'before_play_sample_mobile.png'),
                fullPage: false // Viewport only to focus on the section
            });
        }

        await mobilePage.close();

        console.log('\n✅ All Phase 1 screenshots captured successfully!');
        console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);

    } catch (error) {
        console.error('Error capturing screenshots:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

captureScreenshots().catch(console.error);

