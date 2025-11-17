import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const createAuditSchema = z.object({
  performedByUserId: z.string().uuid('ID de usuário inválido'),
  measurementPlanVersion: z.string().optional(),
  notes: z.string().optional(),
  answers: z.array(
    z.object({
      checklistItemId: z.string().uuid('ID do item do checklist inválido'),
      answer: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE']),
      comment: z.string().optional(),
    })
  ).min(1, 'Pelo menos uma resposta é necessária'),
});

export const updateNCSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']).optional(),
  severity: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']).optional(),
  assignedToUserId: z.string().uuid().nullable().optional(),
  responsible: z.string().optional(),
  rootCause: z.string().optional(),
  correctiveAction: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});
