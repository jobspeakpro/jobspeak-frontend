const https = require('https');

async function testMailTm() {
    try {
        console.log("Fetching domains...");
        const res = await fetch('https://api.mail.tm/domains');
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        console.log("Domains:", data['hydra:member'].map(d => d.domain));

        const domain = data['hydra:member'][0].domain;
        const email = `testuser_${Date.now()}@${domain}`;
        const password = "Password123!";

        console.log(`Creating account: ${email}`);
        const accRes = await fetch('https://api.mail.tm/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password: password })
        });

        if (!accRes.ok) {
            const err = await accRes.text();
            console.log("Account create failed:", err);
            return;
        }

        console.log("Account created. Getting token...");
        const tokenRes = await fetch('https://api.mail.tm/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: email, password: password })
        });
        const tokenData = await tokenRes.json();
        console.log("Token obtained:", !!tokenData.token);

    } catch (e) {
        console.error("MailTM Test Failed:", e);
    }
}

testMailTm();
