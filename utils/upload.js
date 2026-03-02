import multer from 'multer';
import fs from 'fs';
import path from 'path';

// ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'resumes');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// disk storage configuration for resume files
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) =>
    cb(null, `${new Date().toISOString().split('T')[0]}-${file.originalname}`),
});

// exported middleware so routes can opt‑in when they need file parsing
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
}); // limit to 10MB

export { upload, UPLOAD_DIR };
