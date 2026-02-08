const http = require('http');

const ping = (path) => {
    return new Promise((resolve) => {
        http.get(`http://localhost:5000${path}`, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                console.log(`[GET ${path}] ${res.statusCode} => ${data}`);
                resolve();
            });
        }).on('error', e => console.log(e.message));
    });
};

const run = async () => {
    await ping('/api/verify-notifications');
    await ping('/api/notifications/ping');
};
run();
