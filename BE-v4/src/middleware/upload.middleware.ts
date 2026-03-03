import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';

        // Simple logic: if request url contains 'certificate', use certificates folder
        // Uses req.originalUrl to be safer if baseUrl is different
        // We check req.baseUrl and req.url
        if ((req.baseUrl && req.baseUrl.includes('certificate-template')) ||
            (req.url && req.url.includes('certificate'))) {
            uploadPath = 'uploads/certificates/';
        }

        if (!fs.existsSync(uploadPath)) {
            // console.log('Creating directory:', uploadPath);
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });
export default upload;
