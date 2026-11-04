const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

https.createServer({
    key: fs.readFileSync('./localhost+2-key.pem'),
    cert: fs.readFileSync('./localhost+2.pem')
}, app).listen(443, () => {
    console.log('HTTPS running at https://localhost');
});