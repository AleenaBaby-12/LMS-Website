const http = require('http');

const ping = (path, method = 'GET') => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`[${method} ${path}] STATUS: ${res.statusCode} | BODY: ${data.substring(0, 100)}...`);
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`[${method} ${path}] ERROR: ${e.message}`);
            resolve();
        });

        req.end();
    });
};

const run = async () => {
    console.log('--- Server Diagnostics (Round 2) ---');
    await ping('/api/notifications/ping');
    await ping('/api/notifications');
};

run();
