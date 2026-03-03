import express from 'express';
import * as batchController from './batch.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/create-batch', protect, batchController.createBatch);
router.get('/get-all-batches', protect, batchController.getAllBatches);
router.get('/get-batch/:id', protect, batchController.getBatchById);
router.put('/update-batch/:id', protect, batchController.updateBatch);
router.delete('/delete-batch/:id', protect, batchController.deleteBatch);

export default router;
