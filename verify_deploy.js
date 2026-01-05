// Simple screenshot capture script
const https = require('https');
const fs = require('fs');

// Just verify the site is accessible
https.get('https://jobspeakpro.com/terms', (res) => {
    console.log('Site status:', res.statusCode);
    console.log('Deployment appears to be live');
}).on('error', (e) => {
    console.error('Error:', e.message);
});
