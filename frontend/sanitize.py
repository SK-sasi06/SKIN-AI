import os

fe = r'C:\Users\SASI\.gemini\antigravity\scratch\ALSKINCARE-AI\frontend'

def clean_file(path):
    fp = os.path.join(fe, path)
    with open(fp, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    bs = chr(92)
    q = chr(34)
    sq = chr(39)
    dol = chr(36)

    content = content.replace(bs + q, q)
    content = content.replace(bs + sq, sq)
    content = content.replace(bs + dol, dol)
    content = content.replace(bs + ' ', ' ')

    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Cleaned:', path)

for p in [
    'src/components/Navbar.jsx',
    'src/components/ProductCard.jsx',
    'src/pages/LandingPage.jsx',
    'src/pages/AuthPage.jsx',
    'src/pages/AnalyzePage.jsx',
    'src/pages/HistoryPage.jsx',
    'src/pages/CatalogPage.jsx',
    'src/App.jsx'
]:
    clean_file(p)
