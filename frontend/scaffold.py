import os

fe = r'C:\Users\SASI\.gemini\antigravity\scratch\ALSKINCARE-AI\frontend'

with open(os.path.join(fe, 'vite.config.js'), 'w', encoding='utf-8') as f:
    f.write('''import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
''')

with open(os.path.join(fe, 'index.html'), 'w', encoding='utf-8') as f:
    f.write('''<!DOCTYPE html>
<html lang= en>
<head>
  <meta charset=UTF-8 />
  <meta name=viewport content=width=device-width initial-scale=1.0 />
  <title>ALSKINCARE AI - Precision Dermatological Skin Analysis</title>
  <script src=https://cdn.tailwindcss.com></script>
</head>
<body class=bg-stone-50 text-stone-900 font-sans antialiased>
  <div id=root></div>
  <script type=module src=/src/main.jsx></script>
</body>
</html>
''')

with open(os.path.join(fe, 'src', 'main.jsx'), 'w', encoding='utf-8') as f:
    f.write('''import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
''')
print('Frontend scaffolding complete!')
