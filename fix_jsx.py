import sys

# Read the file
with open('src/pages/app/PracticeSpeakingPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the malformed tags
content = content.replace('    </div >', '        </div>')
content = content.replace('      </main >', '      </main>')
content = content.replace('{/* Footer */ }', '{/* Footer */}')
content = content.replace('    < footer className = "py-6 text-center" >', '        <footer className="py-6 text-center">')
content = content.replace('      <p className="text-slate-400 dark:text-slate-600 text-sm flex items-center justify-center gap-2">', '          <p className="text-slate-400 dark:text-slate-600 text-sm flex items-center justify-center gap-2">')
content = content.replace('        <span className="material-symbols-outlined text-lg">lock</span>', '            <span className="material-symbols-outlined text-lg">lock</span>')
content = content.replace('        Practice is private.', '            Practice is private.')
content = content.replace('      </p>', '          </p>')
content = content.replace('      </footer >', '        </footer>')

# Write the file
with open('src/pages/app/PracticeSpeakingPage.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("Fixed JSX syntax errors")
