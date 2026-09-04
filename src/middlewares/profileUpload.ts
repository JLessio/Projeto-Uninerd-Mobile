import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const uploadDirectory = path.resolve(process.cwd(), 'uploads', 'profiles');
fs.mkdirSync(uploadDirectory, { recursive: true });

const extensions: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const acceptedExtensions: Record<string, ReadonlySet<string>> = {
  'image/jpeg': new Set(['.jpg', '.jpeg']),
  'image/png': new Set(['.png']),
  'image/webp': new Set(['.webp']),
};

export const profileUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_req, file, callback) => {
      const timestamp = new Date().toISOString().replace(/\D/g, '');
      callback(null, `perfil-${timestamp}-${crypto.randomBytes(6).toString('hex')}${extensions[file.mimetype]}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const receivedExtension = path.extname(file.originalname).toLowerCase();
    if (!extensions[file.mimetype] || !acceptedExtensions[file.mimetype]?.has(receivedExtension)) {
      return callback(new Error('Envie uma imagem JPG, PNG ou WEBP com extensão correspondente ao formato.'));
    }
    callback(null, true);
  },
});
