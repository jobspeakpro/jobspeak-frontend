
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

// FIX: Handle Windows Environment
const home = process.env.HOME || process.env.USERPROFILE || os.homedir();
process.env.HOME = home;
process.env.USERPROFILE = process.env.USERPROFILE || home;

// Screenshots dir
const proofDir = path.join(__dirname, 'docs', 'proofs', 'activity');
if (!fs.existsSync(proofDir)) fs.mkdirSync(proofDir, { recursive: true });

const GUEST_KEY = '50158919-0025-4b72-9a26-56df4ddcf86d';

(async () => {
    console.log('🚀 Starting CANONICAL Truth Table Proof (Host-Aligned)...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    let reportRows = [];
    let detectedApiBase = ''; // We will capture this from the first POST

    // Helper to log and capture
    async function captureTruth(stepName, actionFn, screenshotName, forceUrl = null) {
        console.log(`\n▶️ ${stepName}`);

        let reqHeaders = {};
        let resHeaders = {};
        let status = 0;
        let url = '';
        let body = {};
        let captured = false;

        const responseHandler = async (resp) => {
            const rUrl = resp.url();
            // Match based on what we expect
            if (forceUrl) {
                if (!rUrl.startsWith(forceUrl)) return;
            } else {
                if (!rUrl.includes('/api/activity/start')) return;
            }

            if (captured) return;
            captured = true;

            url = rUrl;
            status = resp.status();
            resHeaders = await resp.allHeaders();
            reqHeaders = await resp.request().allHeaders();

            // Capture API base from the POST
            if (!detectedApiBase && rUrl.includes('/api/activity/start')) {
                detectedApiBase = new URL(rUrl).origin;
                console.log(`🎯 Detected App API Base: ${detectedApiBase}`);
            }

            try {
                body = await resp.json();
            } catch (e) { body = { error: 'Could not parse JSON' }; }
        };

        page.on('response', responseHandler);

        // Execute Action
        await actionFn();

        if (!captured) await page.waitForTimeout(3000);

        page.off('response', responseHandler);

        if (Object.keys(resHeaders).length > 0 && !resHeaders['x-identity-used']) {
            console.warn(`⚠️ WARNING: x-identity-used MISSING for ${url}`);
        }

        // Render details to page
        const displayHtml = `
            <div style="font-family: monospace; padding: 20px; background: #111; color: #0f0;">
                <h1>${stepName}</h1>
                <h2 style="color: #fff">URL: ${url}</h2>
                <h3 style="color: #ff0">Status: ${status}</h3>
                
                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1; border: 1px solid #333; padding: 10px;">
                        <h4 style="border-bottom: 1px solid #333">Request Headers</h4>
                        <pre>${JSON.stringify(reqHeaders, null, 2)}</pre>
                    </div>
                    <div style="flex: 1; border: 1px solid #333; padding: 10px;">
                        <h4 style="border-bottom: 1px solid #333">Response Headers</h4>
                        <pre>${JSON.stringify(resHeaders, null, 2)}</pre>
                    </div>
                </div>

                <div style="border: 1px solid #333; padding: 10px; margin-top: 20px;">
                    <h4 style="border-bottom: 1px solid #333">Response Body Summary</h4>
                    <pre>${JSON.stringify(body, null, 2).substring(0, 2000)}...</pre>
                </div>
            </div>
        `;

        // Only screenshot if we captured something
        if (captured) {
            await page.setContent(displayHtml);
            await page.screenshot({ path: path.join(proofDir, screenshotName), fullPage: true });

            // Add to report
            const commit = resHeaders['x-jsp-backend-commit'] || 'MISSING';
            const identity = resHeaders['x-identity-used'] || 'MISSING';

            let summary = '-';
            if (Array.isArray(body)) summary = `Length: ${body.length}`;
            else if (body.recentActivity) summary = `Recent: ${body.recentActivity.length}`;
            else if (body.activityEvents) summary = `Events: ${body.activityEvents.length}`;
            else if (body.message) summary = `Msg: ${body.message}`;
            else summary = 'Object';

            const row = `| **${stepName}** | \`${url}\` | **${status}** | \`${reqHeaders['x-guest-key'] || 'MISSING'}\` | \`${identity}\` | \`${commit}\` | \`${summary}\` |`;
            reportRows.push(row);
        } else {
            console.log(`❌ Failed to capture ${stepName}`);
            reportRows.push(`| **${stepName}** | FAILED TO CAPTURE | - | - | - | - |`);
        }

        return body;
    }

    try {
        console.log('🔑 Setting Guest Key...');
        await page.goto('https://jobspeakpro.com/');
        await page.evaluate((key) => localStorage.setItem('jsp_guest_userKey', key), GUEST_KEY);

        // 1. POST /api/activity/start (Triggered by App)
        // This will define detectedApiBase
        await captureTruth('POST /api/activity/start', async () => {
            await page.goto('https://jobspeakpro.com/practice?skipOnboarding=1&debug=1');
            try {
                await page.waitForResponse(resp => resp.url().includes('/api/activity/start') && resp.status() === 200, { timeout: 10000 });
            } catch (e) { console.log('POST timed out or not 200'); }
        }, 'H1_start_headers.png');

        if (!detectedApiBase) {
            throw new Error("Could not detect API Base from POST. Aborting.");
        }

        // 2-4. GET PROBES using detectedApiBase (Direct Fetch)
        // We use page.evaluate to run fetch in the browser context, but using the absolute URL we found.

        await captureTruth('GET /api/activity/events', async () => {
            const target = `${detectedApiBase}/api/activity/events`;
            await page.evaluate(async ({ url, key }) => {
                await fetch(url, { headers: { 'x-guest-key': key } });
            }, { url: target, key: GUEST_KEY });
        }, 'H2_events_headers.png', detectedApiBase);

        await captureTruth('GET /api/dashboard/summary', async () => {
            const target = `${detectedApiBase}/api/dashboard/summary`;
            await page.evaluate(async ({ url, key }) => {
                await fetch(url, { headers: { 'x-guest-key': key } });
            }, { url: target, key: GUEST_KEY });
        }, 'H3_dashboard_headers.png', detectedApiBase);

        await captureTruth('GET /api/progress', async () => {
            const target = `${detectedApiBase}/api/progress`;
            await page.evaluate(async ({ url, key }) => {
                await fetch(url, { headers: { 'x-guest-key': key } });
            }, { url: target, key: GUEST_KEY });
        }, 'H4_progress_headers.png', detectedApiBase);

        // Generate Report
        const md = `
# Canonical Truth Table (Host Aligned)
**Timestamp**: ${new Date().toISOString()}
**Guest Key**: \`${GUEST_KEY}\`
**Verified API Host**: \`${detectedApiBase}\`

| Call | Full URL | Status | Req x-guest-key | Res x-identity-used | Res Backend Commit | Response Summary |
| -- | -- | -- | -- | -- | -- | -- |
${reportRows.join('\n')}

`;
        fs.writeFileSync(path.join(proofDir, 'TRUTH_TABLE_CANONICAL.md'), md);
        console.log('✅ TRUTH_TABLE_CANONICAL.md generated.');

    } catch (err) {
        console.error('❌ Automation Error:', err);
    } finally {
        await browser.close();
    }
})();
