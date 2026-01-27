const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://jobspeakpro.com';
const PROOF_DIR = path.join(__dirname, 'docs/proofs/2026-01-24_fix_v4/e2e_errors_round2');

if (!fs.existsSync(PROOF_DIR)) {
    fs.mkdirSync(PROOF_DIR, { recursive: true });
}

const log = (msg) => {
    const ts = new Date().toISOString();
    console.log(`[${ts}] ${msg}`);
};

(async () => {
    log(`🔍 Capturing detailed 500 error request/response for backend debugging...`);

    const browser = await chromium.launch({ headless: false }); // Non-headless to capture DevTools
    const context = await browser.newContext();
    const page = await context.newPage();

    // Enable DevTools Protocol to capture network details
    const client = await context.newCDPSession(page);
    await client.send('Network.enable');

    let requestDetails = null;
    let responseDetails = null;

    // Capture request
    client.on('Network.requestWillBeSent', (params) => {
        if (params.request.url.includes('/affiliate/apply') && params.request.method === 'POST') {
            requestDetails = {
                url: params.request.url,
                method: params.request.method,
                headers: params.request.headers,
                postData: params.request.postData
            };
            log(`📤 Captured request to: ${params.request.url}`);
        }
    });

    // Capture response
    client.on('Network.responseReceived', async (params) => {
        if (params.response.url.includes('/affiliate/apply')) {
            responseDetails = {
                status: params.response.status,
                statusText: params.response.statusText,
                headers: params.response.headers,
                requestId: params.requestId
            };
            log(`📥 Captured response: ${params.response.status} ${params.response.statusText}`);
        }
    });

    try {
        log('📋 Navigating to /affiliate/apply');
        await page.goto(`${TARGET_URL}/affiliate/apply`, { waitUntil: 'load' });
        await page.waitForTimeout(2000);

        const timestamp = Date.now();

        // Fill form
        await page.fill('[data-testid="affiliate-name"]', 'DevTools Capture Test');
        await page.fill('[data-testid="affiliate-email"]', `devtools_${timestamp}@example.com`);
        await page.selectOption('[data-testid="affiliate-country"]', 'US');
        await page.selectOption('[data-testid="affiliate-platform"]', 'twitter');
        await page.selectOption('[data-testid="affiliate-audience"]', '10k');
        await page.fill('[data-testid="affiliate-link"]', 'https://twitter.com/devtoolstest');
        await page.fill('[data-testid="affiliate-strategy"]', 'DevTools network capture test');
        await page.check('[data-testid="payout-paypal"]');
        await page.fill('[data-testid="affiliate-paypal-email"]', `paypal_devtools_${timestamp}@example.com`);

        log('✅ Form filled');

        // Submit and wait for response
        await page.click('[data-testid="affiliate-submit"]');
        await page.waitForTimeout(3000);

        // Save request details
        if (requestDetails) {
            const requestInfo = {
                url: requestDetails.url,
                method: requestDetails.method,
                headers: requestDetails.headers,
                payload: requestDetails.postData ? JSON.parse(requestDetails.postData) : null
            };

            fs.writeFileSync(
                path.join(PROOF_DIR, 'request_payload.json'),
                JSON.stringify(requestInfo.payload, null, 2)
            );

            fs.writeFileSync(
                path.join(PROOF_DIR, 'request_details.json'),
                JSON.stringify(requestInfo, null, 2)
            );

            log(`✅ Saved request details`);
        }

        // Save response details
        if (responseDetails) {
            const responseInfo = {
                status: responseDetails.status,
                statusText: responseDetails.statusText,
                headers: responseDetails.headers
            };

            // Get response body
            try {
                const responseBody = await client.send('Network.getResponseBody', {
                    requestId: responseDetails.requestId
                });
                responseInfo.body = responseBody.body;
            } catch (e) {
                log(`⚠️  Could not get response body: ${e.message}`);
            }

            fs.writeFileSync(
                path.join(PROOF_DIR, 'response_details.json'),
                JSON.stringify(responseInfo, null, 2)
            );

            log(`✅ Saved response details (${responseDetails.status})`);
        }

        // Take screenshots
        await page.screenshot({ path: path.join(PROOF_DIR, 'error_page_state.png'), fullPage: true });
        log(`✅ Saved error page screenshot`);

        log('✅ All details captured successfully');

    } catch (e) {
        log(`❌ ERROR: ${e.message}`);
    } finally {
        await browser.close();
    }
})();
