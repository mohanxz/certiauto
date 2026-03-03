import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as bulkUploadController from './bulk-upload.controller';
import { protect } from '../../../middleware/auth.middleware';

const router = express.Router();

// Configure Multer
const uploadDir = path.join(__dirname, '../../../../uploads/bulk');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheetml')) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'));
        }
    }
});

router.get('/download-template', protect, bulkUploadController.downloadTemplate);
router.post('/upload', protect, upload.single('file'), bulkUploadController.uploadBulkFile);
router.get('/history', protect, bulkUploadController.getUploadHistory);
router.get('/history/:id', protect, bulkUploadController.getUploadJobDetails);

export default router;
