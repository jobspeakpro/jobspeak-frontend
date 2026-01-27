import { chromium } from 'playwright';

const URL_BASE = 'https://jobspeakpro.com';
const USER_EMAIL = "jsp.qa.002@jobspeakpro-test.local";
const USER_PASS = "jsp.qa.002@jobspeakpro-test.local";

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Login
    console.log('Logging in...');
    await page.goto(`${URL_BASE}/signin`);
    await page.fill('input[type="email"]', USER_EMAIL);
    await page.fill('input[type="password"]', USER_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    console.log('Logged in.');

    // Check Endpoints
    const checkEndpoint = async (url, method = 'GET') => {
        const response = await page.evaluate(async ({ url, method }) => {
            try {
                // Get token from session storage or local storage if needed, or assume cookie
                // apiClient logic suggests cookies + headers
                // We'll mimic a fetch call similar to apiClient (simple version)
                const res = await fetch(url, { method });
                return { status: res.status, data: await res.json().catch(() => ({})) };
            } catch (e) {
                return { error: e.toString() };
            }
        }, { url, method });
        console.log(`[${method}] ${url} -> Status: ${response.status}`);
        return response;
    };

    await checkEndpoint('/api/referrals/me');
    await checkEndpoint('/api/referrals/history');
    await checkEndpoint('/api/referrals/redeem', 'POST'); // Guessing POST
    await checkEndpoint('/api/referrals/stats'); // Guessing Stats

    await browser.close();
})();
