import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { updateNCSchema } from '../../lib/validation';
import { sendNCStatusChangeEmail } from '../../lib/email';
import { NCStatus } from '@prisma/client';

export async function getNonConformities(req: Request, res: Response) {
  try {
    const { status } = req.query;

    const where = status ? { status: status as NCStatus } : {};

    const ncs = await prisma.nonConformity.findMany({
      where,
      include: {
        checklistItem: {
          select: {
            code: true,
            title: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        openedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(ncs);
  } catch (error) {
    console.error('Erro ao buscar não conformidades:', error);
    res.status(500).json({ error: 'Erro ao buscar não conformidades' });
  }
}

export async function getNonConformityById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const nc = await prisma.nonConformity.findUnique({
      where: { id },
      include: {
        checklistItem: true,
        audit: {
          include: {
            performedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        openedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        events: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!nc) {
      return res.status(404).json({ error: 'Não conformidade não encontrada' });
    }

    res.json(nc);
  } catch (error) {
    console.error('Erro ao buscar não conformidade:', error);
    res.status(500).json({ error: 'Erro ao buscar não conformidade' });
  }
}

export async function updateNonConformity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const data = updateNCSchema.parse(req.body);

    // Buscar NC atual
    const currentNC = await prisma.nonConformity.findUnique({
      where: { id },
      include: {
        assignedTo: true,
      },
    });

    if (!currentNC) {
      return res.status(404).json({ error: 'Não conformidade não encontrada' });
    }

    // Atualizar NC e criar evento em transação
    const updatedNC = await prisma.$transaction(async (tx) => {
      // Atualizar NC
      const updated = await tx.nonConformity.update({
        where: { id },
        data: {
          ...data,
          resolvedAt: data.status === 'RESOLVED' ? new Date() : currentNC.resolvedAt,
        },
        include: {
          checklistItem: true,
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          openedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Se o status mudou, criar evento
      if (data.status && data.status !== currentNC.status) {
        await tx.nonConformityEvent.create({
          data: {
            nonConformityId: id,
            eventType: 'STATUS_CHANGED',
            oldStatus: currentNC.status,
            newStatus: data.status,
            createdByUserId: userId,
          },
        });

        // Enviar email de mudança de status (async)
        if (updated.assignedTo?.email) {
          sendNCStatusChangeEmail(
            updated.title,
            currentNC.status,
            data.status,
            updated.assignedTo.email
          ).catch(err => console.error('Erro ao enviar email:', err));
        }
      }

      // Se o responsável mudou, criar evento
      if (data.assignedToUserId !== undefined && data.assignedToUserId !== currentNC.assignedToUserId) {
        await tx.nonConformityEvent.create({
          data: {
            nonConformityId: id,
            eventType: 'ASSIGNMENT_CHANGED',
            comment: `Responsável alterado`,
            createdByUserId: userId,
          },
        });
      }

      return updated;
    });

    res.json(updatedNC);
  } catch (error) {
    console.error('Erro ao atualizar não conformidade:', error);
    res.status(400).json({ error: 'Erro ao atualizar não conformidade' });
  }
}
