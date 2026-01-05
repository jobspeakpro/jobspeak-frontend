import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/a2887666-1b54-422f-b044-4574d05c0809';
const CREDENTIALS = {
    email: 'test_audio_20250109_1@guerrillamail.com',
    password: 'TestAudio123!'
};

async function captureScreenshots() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();

    try {
        // MOBILE SCREENSHOTS
        console.log('\\n=== CAPTURING MOBILE SCREENSHOTS ===\\n');

        const mobilePage = await context.newPage();
        await mobilePage.setViewportSize({ width: 375, height: 667 });

        // Login for mobile authenticated pages
        console.log('Logging in (mobile)...');
        await mobilePage.goto('https://jobspeakpro.com/signin');
        await mobilePage.waitForTimeout(2000);
        await mobilePage.fill('#email', CREDENTIALS.email);
        await mobilePage.fill('#password', CREDENTIALS.password);
        await mobilePage.click('button[type="submit"]');
        await mobilePage.waitForTimeout(3000);

        // Mock Interview (mobile)
        console.log('Capturing: Mock Interview (mobile)');
        await mobilePage.goto('https://jobspeakpro.com/mock-interview');
        await mobilePage.waitForTimeout(2000);
        await mobilePage.screenshot({
            path: path.join(ARTIFACTS_DIR, 'before_mock_interview_mobile.png'),
            fullPage: true
        });

        // Progress (mobile)
        console.log('Capturing: Progress (mobile)');
        await mobilePage.goto('https://jobspeakpro.com/progress');
        await mobilePage.waitForTimeout(2000);
        await mobilePage.screenshot({
            path: path.join(ARTIFACTS_DIR, 'before_progress_mobile.png'),
            fullPage: true
        });

        // Profile (mobile)
        console.log('Capturing: Profile (mobile)');
        await mobilePage.goto('https://jobspeakpro.com/profile');
        await mobilePage.waitForTimeout(2000);
        await mobilePage.screenshot({
            path: path.join(ARTIFACTS_DIR, 'before_profile_mobile.png'),
            fullPage: true
        });

        await mobilePage.close();

        // DESKTOP SCREENSHOTS
        console.log('\\n=== CAPTURING DESKTOP SCREENSHOTS ===\\n');

        const desktopPage = await context.newPage();
        await desktopPage.setViewportSize({ width: 1920, height: 1080 });

        // Play Sample (desktop) - try multiple URLs
        console.log('Capturing: Play Sample (desktop)');
        try {
            await desktopPage.goto('https://jobspeakpro.com/play-sample', { waitUntil: 'networkidle', timeout: 10000 });
        } catch (e) {
            console.log('  /play-sample not found, trying /sample...');
            try {
                await desktopPage.goto('https://jobspeakpro.com/sample', { waitUntil: 'networkidle', timeout: 10000 });
            } catch (e2) {
                console.log('  /sample not found, trying /demo...');
                await desktopPage.goto('https://jobspeakpro.com/demo', { waitUntil: 'networkidle', timeout: 10000 });
            }
        }
        await desktopPage.waitForTimeout(2000);
        await desktopPage.screenshot({
            path: path.join(ARTIFACTS_DIR, 'before_play_sample_desktop.png'),
            fullPage: true
        });

        // Play Sample (mobile)
        console.log('Capturing: Play Sample (mobile)');
        const mobilePage2 = await context.newPage();
        await mobilePage2.setViewportSize({ width: 375, height: 667 });
        try {
            await mobilePage2.goto('https://jobspeakpro.com/play-sample', { waitUntil: 'networkidle', timeout: 10000 });
        } catch (e) {
            try {
                await mobilePage2.goto('https://jobspeakpro.com/sample', { waitUntil: 'networkidle', timeout: 10000 });
            } catch (e2) {
                await mobilePage2.goto('https://jobspeakpro.com/demo', { waitUntil: 'networkidle', timeout: 10000 });
            }
        }
        await mobilePage2.waitForTimeout(2000);
        await mobilePage2.screenshot({
            path: path.join(ARTIFACTS_DIR, 'before_play_sample_mobile.png'),
            fullPage: true
        });
        await mobilePage2.close();

        await desktopPage.close();

        console.log('\\n✅ All missing screenshots captured successfully!');

    } catch (error) {
        console.error('Error capturing screenshots:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

captureScreenshots().catch(console.error);
