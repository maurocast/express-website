
const express = require('express');
const net = require('node:net');
const { execFile } = require('node:child_process');
const path = require('path');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const app = express();
const geocoderPromise = import('node-geocoder').then(({ default: NodeGeocoder }) =>
    NodeGeocoder({ provider: 'openstreetmap' })
);

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
//app.get('/prova', (req, res) => {
//    res.sendFile(path.join(__dirname, 'public', 'prova.html'));
//});
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

const apiRouterPromise = import('./api.mjs').then(({ default: router }) => router);
app.use('/api', (req, res, next) => {
    apiRouterPromise.then(router => router(req, res, next), next);
});


// 404 handler
app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

// Start HTTP server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

async function isAddressInUse(port, host) {
    return new Promise((resolve, reject) => {
        const tester = net.createServer();

        tester.once('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                resolve(true);
            } else {
                reject(error);
            }
        });

        tester.once('listening', () => {
            tester.close(() => resolve(false));
        });

        tester.listen(port, host);
    });
}

async function getListeningProcessIds(port) {
    if (process.platform === 'win32') {
        const { stdout } = await execFileAsync('netstat.exe', ['-ano', '-p', 'tcp']);
        const processIds = stdout.split(/\r?\n/).flatMap((line) => {
            const columns = line.trim().split(/\s+/);
            if (columns[0] !== 'TCP' || columns[3] !== 'LISTENING') {
                return [];
            }

            const localPort = Number(columns[1].slice(columns[1].lastIndexOf(':') + 1));
            const processId = Number(columns[4]);
            return localPort === Number(port) && Number.isSafeInteger(processId) && processId > 0
                ? [processId]
                : [];
        });
        return [...new Set(processIds)];
    }

    try {
        const { stdout } = await execFileAsync('lsof', [
            '-nP', '-t', `-iTCP:${port}`, '-sTCP:LISTEN'
        ]);
        return [...new Set(stdout.trim().split(/\s+/).filter(Boolean).map(Number))];
    } catch (error) {
        if (error.code === 1 && !error.stdout) {
            return [];
        }
        throw error;
    }
}

async function stopListeningProcesses(port) {
    const processIds = await getListeningProcessIds(port);
    if (processIds.length === 0) {
        throw new Error(`Could not identify the process using port ${port}.`);
    }

    for (const processId of processIds) {
        if (processId === process.pid) {
            continue;
        }

        if (process.platform === 'win32') {
            await execFileAsync('taskkill.exe', ['/PID', String(processId), '/F']);
        } else {
            process.kill(processId, 'SIGTERM');
        }
    }
}

(async () => {
    const addressInUse = await isAddressInUse(PORT, HOST);

    if (addressInUse) {
        console.warn(`Address ${HOST}:${PORT} is already in use. Stopping the process using port ${PORT}.`);
        await stopListeningProcesses(PORT);
    }

    const server = app.listen(PORT, HOST, () => {
        console.log(`Express HTTP server running on http://localhost:${PORT}`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Address ${HOST}:${PORT} is already in use. Please stop the existing process or change PORT.`);
            process.exit(1);
        }

        throw error;
    });
})();
