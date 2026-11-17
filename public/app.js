
import path from 'node:path';
import fs from 'fs'

const app = express.Router();

const FILES_DIR = path.resolve(__dirname, "files");

function resolveDirectory(relativePath = "") {
    const resolved = path.resolve(FILES_DIR, relativePath);

    if (
        resolved !== FILES_DIR &&
        !resolved.startsWith(FILES_DIR + path.sep)
    ) {
        throw new Error("Invalid path");
    }

    return resolved;
}

app.get("/api/files", (req, res) => {
    try {
        const dir = resolveDirectory(req.query.path || "");

        const items = fs.readdirSync(dir, {
            withFileTypes: true
        }).map(item => {
            const fullPath = path.join(dir, item.name);
            const stats = fs.statSync(fullPath);

            return {
                name: item.name,
                isDirectory: item.isDirectory(),
                size: stats.size,
                modified: stats.mtime
            };
        });

        res.json(items);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

app.get("/api/download", (req, res) => {
    try {
        const filePath = resolveDirectory(req.query.path || "");

        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            return res.status(404).json({
                error: "File not found"
            });
        }

        res.download(filePath);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});
