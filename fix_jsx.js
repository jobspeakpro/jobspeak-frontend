const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/pages/app/PracticeSpeakingPage.jsx', 'utf8');

// Fix the malformed tags
content = content.replace('    </div >', '        </div>');
content = content.replace('      </main >', '      </main>');
content = content.replace('{/* Footer */ }', '{/* Footer */}');
content = content.replace('    < footer className = "py-6 text-center" >', '        <footer className="py-6 text-center">');
content = content.replace('      <p className="text-slate-400 dark:text-slate-600 text-sm flex items-center justify-center gap-2">', '          <p className="text-slate-400 dark:text-slate-600 text-sm flex items-center justify-center gap-2">');
content = content.replace('        <span className="material-symbols-outlined text-lg">lock</span>', '            <span className="material-symbols-outlined text-lg">lock</span>');
content = content.replace('        Practice is private.', '            Practice is private.');
content = content.replace('      </p>', '          </p>');
content = content.replace('      </footer >', '        </footer>');

// Write the file
fs.writeFileSync('src/pages/app/PracticeSpeakingPage.jsx', content, 'utf8');

console.log("Fixed JSX syntax errors");
