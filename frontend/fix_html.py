import os

html_path = r'C:\Users\SASI\.gemini\antigravity\scratch\ALSKINCARE-AI\frontend\index.html'
content = '''<!DOCTYPE html>
<html lang=" en\>
<head>
 <meta charset=\UTF-8\ />
 <meta name=\viewport\ content=\width=device-width initial-scale=1.0\ />
 <title>ALSKINCARE AI ? Precision Dermatological Skin Analysis</title>
 <script src=\https://cdn.tailwindcss.com\></script>
</head>
<body class=\bg-stone-50 text-stone-900 font-sans antialiased\>
 <div id=\root\></div>
 <script type=\module\ src=\/src/main.jsx\></script>
</body>
</html>
'''

with open(html_path, 'w', encoding='utf-8') as f:
 f.write(content)
print('Fixed index.html quotes!')
