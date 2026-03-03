import { Router } from 'express';
import {
    createEmail,
    getEmails,
    updateEmail,
    deleteEmail,
    activateEmail
} from './email.controller';

const router = Router();

router.post('/', createEmail);
router.get('/', getEmails);
router.put('/:id', updateEmail);
router.put('/activate/:id', activateEmail);   // ⭐ Dedicated activation route
router.delete('/:id', deleteEmail);

export default router;