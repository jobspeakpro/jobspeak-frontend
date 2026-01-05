
const https = require('https');

const payload = JSON.stringify({
    text: "leverage",
    voiceId: "us_female_emma",
    speed: 1
});

const options = {
    hostname: 'jobspeakpro.com',
    port: 443,
    path: '/api/tts',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response received.');

        try {
            const json = JSON.parse(data);
            if (json.audioUrl) {
                console.log("SUCCESS: Received audioUrl");
                console.log("Audio URL starts with: " + json.audioUrl.substring(0, 50));
            } else if (json.audioBase64) {
                console.log("SUCCESS: Received audioBase64");
                console.log("Audio Base64 length: " + json.audioBase64.length);
            } else {
                console.log("FAILURE: No audio data in response");
                console.log("Preview: " + data.substring(0, 200));
            }
        } catch (e) {
            console.log("Response is not JSON, might be raw audio?");
            console.log("Data length: " + data.length);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(payload);
req.end();
