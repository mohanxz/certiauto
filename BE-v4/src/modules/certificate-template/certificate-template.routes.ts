import express from 'express';
import { uploadTemplate, getAllTemplates, deleteTemplate } from './certificate-template.controller';
import { protect } from '../../middleware/auth.middleware';
import upload from '../../middleware/upload.middleware';

const router = express.Router();

router.post('/upload', protect, upload.single('file'), uploadTemplate);
router.get('/get-all-templates', protect, getAllTemplates);
router.delete('/delete-template/:id', protect, deleteTemplate);

export default router;
