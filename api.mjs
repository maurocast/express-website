import express from 'express';
import multer from 'multer';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = express.Router();
const filesDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public', 'files');
const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, callback) => {
            mkdir(filesDirectory, { recursive: true })
                .then(() => callback(null, filesDirectory), callback);
        },
        filename: (_req, file, callback) => {
            callback(null, path.basename(file.originalname.replace(/\\/g, '/')));
        }
    }),
    fileFilter: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, extension === '.fit' || extension === '.geojson');
    },
    limits: { files: 1 }
});

router.get('/files', async (req, res, next) => {
    try {
        const entries = await readdir(filesDirectory, { withFileTypes: true });
        const files = entries
            .filter(entry => entry.isFile() && path.extname(entry.name).toLowerCase() === '.fit')
            .map(entry => entry.name)
            .sort();

        res.json(files);
    } catch (error) {
        next(error);
    }
});

router.post('/files', (req, res, next) => {
    upload.single('file')(req, res, error => {
        if (error) {
            if (error instanceof multer.MulterError) {
                return res.status(400).json({ error: error.message });
            }
            return next(error);
        }

        if (!req.file) {
            return res.status(400).json({ error: 'A .fit or .geojson file field named "file" is required.' });
        }

        res.status(201).json({ filename: req.file.filename });
    });
});

export default router;
