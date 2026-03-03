import express from 'express';
import * as controller from './bulk-email.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/create', protect, controller.createJob);
router.get('/history', protect, controller.getJobs);
router.get('/:id', protect, controller.getJobDetails);
router.post('/:id/retry', protect, controller.retryJob);
router.post('/:id/retry/:studentId', protect, controller.retryJobItem);

export default router;
