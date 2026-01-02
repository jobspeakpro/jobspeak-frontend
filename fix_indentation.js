const fs = require('fs');

// Read the file
const content = fs.readFileSync('src/pages/app/PracticeSpeakingPage.jsx', 'utf8');
const lines = content.split('\r\n');

// Fix line 1330 (index 1329): change 10 spaces to 8 spaces
if (lines[1329] && lines[1329].trim() === '</div>') {
    lines[1329] = '        </div>';
    console.log('Fixed line 1330: changed indentation from 10 to 8 spaces');
}

// Fix line 1332 (index 1331): ensure correct indentation for comment
if (lines[1331] && lines[1331].includes('{/* Footer */}')) {
    lines[1331] = '        {/* Footer */}';
    console.log('Fixed line 1332: corrected comment indentation');
}

// Write the file back
fs.writeFileSync('src/pages/app/PracticeSpeakingPage.jsx', lines.join('\r\n'), 'utf8');
console.log('File updated successfully');
