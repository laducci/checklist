import { Router } from 'express';
import { getUsers, getUserById } from './users.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getUsers);
router.get('/:id', getUserById);

export default router;
