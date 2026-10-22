import os

html_path = 'index.html'
lines = [
    '<!DOCTYPE html>',
    '<html lang=" en\>',
 '<head>',
 ' <meta charset=\UTF-8\ />',
 ' <meta name=\viewport\ content=\width=device-width initial-scale=1.0\ />',
 ' <title>ALSKINCARE AI</title>',
 ' <script src=\https://cdn.tailwindcss.com\></script>',
 '</head>',
 '<body class=\bg-stone-50 text-stone-900 font-sans antialiased\>',
 ' <div id=\root\></div>',
 ' <script type=\module\ src=\/src/main.jsx\></script>',
 '</body>',
 '</html>'
]
with open(html_path, 'w', encoding='utf-8') as f:
 f.write('\n'.join(lines) + '\n')
print('Corrected index.html successfully')
