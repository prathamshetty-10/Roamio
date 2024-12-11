import path from 'path';
import multer from 'multer';

const upload = multer({
    dest: 'uploads/', 
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB size limit
    storage: multer.diskStorage({
        destination: 'uploads/',
        filename: (_req, file, cb) => {
            cb(null, file.originalname);
        },
    }),
    fileFilter: (_req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (
            ext !== ".jpg" &&
            ext !== ".jpeg" &&
            ext !== ".webp" &&
            ext !== ".png" &&
            ext !== ".mp4" &&
            ext !== ".pdf" &&
            ext !== ".txt" &&
            ext !== ".PNG" &&
            ext !== ".JPG"
        ) {
            cb(new Error(`unsupported file type! ${ext}`), false); // Corrected string interpolation
            return;
        }
        cb(null, true);
    },
});

export { upload };
