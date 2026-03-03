import express from 'express';
import * as logController from './maillog.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/history', protect, logController.getEmailLogs);

export default router;
