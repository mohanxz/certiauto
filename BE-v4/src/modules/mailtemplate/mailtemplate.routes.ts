import express from 'express';
import * as templateController from './mailtemplate.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/create-template', protect, templateController.createTemplate);
router.get('/get-all-templates', protect, templateController.getAllTemplates);
router.get('/get-template/:id', protect, templateController.getTemplateById);
router.put('/update-template/:id', protect, templateController.updateTemplate);
router.delete('/delete-template/:id', protect, templateController.deleteTemplate);

export default router;
