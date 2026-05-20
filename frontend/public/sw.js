// This tells the phone that the app is safe to install
self.addEventListener('install', (e) => {
    console.log('[Service Worker] Installed');
});

// This lets the app fetch data from your Node.js backend
self.addEventListener('fetch', (e) => {
    // Pass-through
});