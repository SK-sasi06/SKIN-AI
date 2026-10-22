const fs = require('fs');
const q = String.fromCharCode(34);
const html = '<!DOCTYPE html>\n<html lang=' + q + 'en' + q + '>\n<head>\n  <meta charset=' + q + 'UTF-8' + q + ' />\n  <meta name=' + q + 'viewport' + q + ' content=' + q + 'width=device-width, initial-scale=1.0' + q + ' />\n  <title>ALSKINCARE AI</title>\n  <script src=' + q + 'https://cdn.tailwindcss.com' + q + '></script>\n</head>\n<body class=' + q + 'bg-stone-50 text-stone-900 font-sans antialiased' + q + '>\n  <div id=' + q + 'root' + q + '></div>\n  <script type=' + q + 'module' + q + ' src=' + q + '/src/main.jsx' + q + '></script>\n</body>\n</html>\n';
fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed index.html perfectly!');
