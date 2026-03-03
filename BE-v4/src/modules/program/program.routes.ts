import express from 'express';
import * as programController from './program.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/create-program', protect, programController.createProgram);
router.get('/get-all-programs', protect, programController.getAllPrograms);
router.get('/:id', protect, programController.getProgramById);
router.put('/:id', protect, programController.updateProgram);
router.delete('/:id', protect, programController.deleteProgram);

export default router;
