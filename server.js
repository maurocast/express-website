
const express = require('express');
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

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on port ${PORT}`);
});
