
const express = require('express');
const https = require('node:https');
const path = require('path');
const fs = require('node:fs/promises');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static website files
app.use(express.static(path.join(__dirname, 'public')));

// Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'prova.html'));
});

// About page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// test page
app.get('/prova', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'prova.html'));
});
// test page
//app.get('/prova', (req, res) => {
  //  res.sendFile(path.join(__dirname, 'public', 'prova.html'));
//});

// API example
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        message: 'Express server is running!',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/files', async (req, res, next) => {
    try {
        const entries = await fs.readdir(path.join(__dirname, 'public', 'files'), {
            withFileTypes: true
        });
        const files = entries
            .filter(entry => entry.isFile())
            .map(entry => entry.name)
            .sort();

        res.json(files);
    } catch (error) {
        next(error);
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

// Start HTTPS server
const PORT = process.env.PORT || 3000;

(async () => {
    const [key, cert] = await Promise.all([
        fs.readFile(path.join(__dirname, 'localhost+2-key.pem')),
        fs.readFile(path.join(__dirname, 'localhost+2.pem'))
    ]);

    https.createServer({ key, cert }, app).listen(PORT, '0.0.0.0', () => {
        console.log(`Express HTTPS server running on https://localhost:${PORT}`);
    });
})();
