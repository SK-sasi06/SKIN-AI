import json, os

pkg_path = r'C:\Users\SASI\.gemini\antigravity\scratch\ALSKINCARE-AI\frontend\package.json'
with open(pkg_path, 'r', encoding='utf-8') as f:
    pkg = json.load(f)

pkg['scripts'] = {
    'dev': 'vite',
    'build': 'vite build',
    'preview': 'vite preview'
}

with open(pkg_path, 'w', encoding='utf-8') as f:
    json.dump(pkg, f, indent=2)
print('Updated package.json scripts!')
