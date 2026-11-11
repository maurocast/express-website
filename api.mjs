import express from 'express';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const filesDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public', 'files');

router.get('/files', async (req, res, next) => {
    try {
        const entries = await readdir(filesDirectory, { withFileTypes: true });
        const files = entries
            .filter(entry => entry.isFile())
            .map(entry => entry.name)
            .sort();

        res.json(files);
    } catch (error) {
        next(error);
    }
});

export default router;
