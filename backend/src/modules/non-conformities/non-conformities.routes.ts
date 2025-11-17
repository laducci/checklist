import { Router } from 'express';
import {
  getNonConformities,
  getNonConformityById,
  updateNonConformity,
} from './non-conformities.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getNonConformities);
router.get('/:id', getNonConformityById);
router.patch('/:id', updateNonConformity);

export default router;
