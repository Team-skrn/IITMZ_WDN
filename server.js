// ✅ Simple Backend Server to Save config.js
// Run this with: node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const CONFIG_PATH = path.join(__dirname, 'config.js');

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // POST /api/save-config
    if (pathname === '/api/save-config' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const configCode = data.config;

                // Write to config.js
                fs.writeFileSync(CONFIG_PATH, configCode, 'utf8');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Configuration saved successfully!',
                    file: CONFIG_PATH
                }));

                console.log('✅ config.js updated successfully');
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Error saving configuration: ' + error.message
                }));

                console.error('❌ Error:', error.message);
            }
        });
        return;
    }

    // GET /api/config - Return current config.js content
    if (pathname === '/api/config' && req.method === 'GET') {
        try {
            const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                config: configContent
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error reading config: ' + error.message
            }));
        }
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        error: 'Endpoint not found'
    }));
});

server.listen(PORT, () => {
    console.log(`\n✅ Configuration Server running on http://localhost:${PORT}`);
    console.log(`📄 Config file: ${CONFIG_PATH}`);
    console.log(`\n📝 API Endpoints:`);
    console.log(`  POST /api/save-config - Save configuration to config.js`);
    console.log(`  GET  /api/config     - Get current config.js content`);
    console.log(`\n💡 The admin panel will send changes to this server.\n`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Try a different port or close the other process.`);
    } else {
        console.error('❌ Server error:', err);
    }
});
