import { Router } from 'express';
import { createAudit, getAudits, getAuditById, getAuditReport } from './audits.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createAudit);
router.get('/', getAudits);
router.get('/:id/report', getAuditReport);
router.get('/:id', getAuditById);

export default router;
