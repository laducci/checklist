import { Router } from 'express';
import { getChecklistItems, getChecklistItemById } from './checklist.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getChecklistItems);
router.get('/:id', getChecklistItemById);

export default router;
