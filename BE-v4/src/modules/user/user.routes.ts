import express from 'express';
import * as userController from './user.controller';

const router = express.Router();

router.post('/login', userController.login);

export default router;
