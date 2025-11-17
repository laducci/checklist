import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { createAuditSchema } from '../../lib/validation';
import { sendNCCreationEmail } from '../../lib/email';

export async function createAudit(req: Request, res: Response) {
  try {
    const data = createAuditSchema.parse(req.body);

    // Calcular percentual de aderência
    const compliantCount = data.answers.filter(a => a.answer === 'COMPLIANT').length;
    const nonCompliantCount = data.answers.filter(a => a.answer === 'NON_COMPLIANT').length;
    const evaluatedCount = compliantCount + nonCompliantCount;
    
    const adherencePercentage = evaluatedCount > 0 
      ? (compliantCount / evaluatedCount) * 100 
      : 0;

    // Criar auditoria e respostas em uma transação
    const audit = await prisma.$transaction(async (tx) => {
      // Criar auditoria
      const newAudit = await tx.audit.create({
        data: {
          performedByUserId: data.performedByUserId,
          measurementPlanVersion: data.measurementPlanVersion,
          notes: data.notes,
          overallAdherencePercentage: adherencePercentage,
          performedAt: new Date(),
        },
      });

      // Criar respostas
      await tx.auditAnswer.createMany({
        data: data.answers.map(answer => ({
          auditId: newAudit.id,
          checklistItemId: answer.checklistItemId,
          answer: answer.answer,
          comment: answer.comment,
        })),
      });

      // Criar NCs para respostas não conformes
      const nonCompliantAnswers = data.answers.filter(a => a.answer === 'NON_COMPLIANT');
      
      for (const answer of nonCompliantAnswers) {
        const checklistItem = await tx.checklistItem.findUnique({
          where: { id: answer.checklistItemId },
        });

        if (!checklistItem) continue;

        await tx.nonConformity.create({
          data: {
            auditId: newAudit.id,
            checklistItemId: answer.checklistItemId,
            openedByUserId: data.performedByUserId,
            title: `NC - ${checklistItem.code}: ${checklistItem.title}`,
            description: answer.comment || checklistItem.description,
            status: 'OPEN',
            severity: 'MEDIA', // Valor padrão, pode ser ajustado
          },
        });
      }

      return newAudit;
    });

    // Buscar auditoria completa para retornar
    const completeAudit = await prisma.audit.findUnique({
      where: { id: audit.id },
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            checklistItem: true,
          },
        },
        nonConformities: {
          include: {
            checklistItem: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Enviar emails para as NCs criadas (async, não bloqueia a resposta)
    if (completeAudit?.nonConformities) {
      completeAudit.nonConformities.forEach(async (nc) => {
        try {
          await sendNCCreationEmail(
            nc.title,
            nc.description,
            nc.checklistItem.code,
            nc.checklistItem.title,
            nc.severity || 'MEDIA',
            nc.responsible || 'A definir',
            nc.assignedTo?.email
          );
          
          // Marcar email como enviado
          await prisma.nonConformity.update({
            where: { id: nc.id },
            data: { 
              emailSent: true,
            } as any,
          });
        } catch (err) {
          console.error('Erro ao enviar email:', err);
        }
      });
    }

    res.status(201).json(completeAudit);
  } catch (error) {
    console.error('Erro ao criar auditoria:', error);
    res.status(400).json({ error: 'Erro ao criar auditoria' });
  }
}

export async function getAudits(req: Request, res: Response) {
  try {
    const audits = await prisma.audit.findMany({
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            nonConformities: true,
          },
        },
      },
      orderBy: { performedAt: 'desc' },
    });

    res.json(audits);
  } catch (error) {
    console.error('Erro ao buscar auditorias:', error);
    res.status(500).json({ error: 'Erro ao buscar auditorias' });
  }
}

export async function getAuditById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const audit = await prisma.audit.findUnique({
      where: { id },
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            checklistItem: true,
          },
          orderBy: {
            checklistItem: {
              code: 'asc',
            },
          },
        },
        nonConformities: {
          include: {
            checklistItem: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!audit) {
      return res.status(404).json({ error: 'Auditoria não encontrada' });
    }

    res.json(audit);
  } catch (error) {
    console.error('Erro ao buscar auditoria:', error);
    res.status(500).json({ error: 'Erro ao buscar auditoria' });
  }
}

export async function getAuditReport(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const audit = await prisma.audit.findUnique({
      where: { id },
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            checklistItem: true,
          },
        },
        nonConformities: {
          include: {
            checklistItem: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!audit) {
      return res.status(404).json({ error: 'Auditoria não encontrada' });
    }

    // Calcular estatísticas gerais
    const totalQuestions = audit.answers.length;
    const compliantCount = audit.answers.filter(a => a.answer === 'COMPLIANT').length;
    const nonCompliantCount = audit.answers.filter(a => a.answer === 'NON_COMPLIANT').length;
    const notApplicableCount = audit.answers.filter(a => a.answer === 'NOT_APPLICABLE').length;
    const evaluatedCount = compliantCount + nonCompliantCount;

    // Agrupar por categoria e calcular aderência
    const categoriesMap = new Map<string, {
      category: string;
      totalQuestions: number;
      compliantCount: number;
      nonCompliantCount: number;
      notApplicableCount: number;
      adherencePercentage: number;
    }>();

    audit.answers.forEach(answer => {
      const category = answer.checklistItem.category;
      
      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, {
          category,
          totalQuestions: 0,
          compliantCount: 0,
          nonCompliantCount: 0,
          notApplicableCount: 0,
          adherencePercentage: 0,
        });
      }

      const categoryData = categoriesMap.get(category)!;
      categoryData.totalQuestions++;

      if (answer.answer === 'COMPLIANT') {
        categoryData.compliantCount++;
      } else if (answer.answer === 'NON_COMPLIANT') {
        categoryData.nonCompliantCount++;
      } else {
        categoryData.notApplicableCount++;
      }

      // Calcular aderência
      const evaluated = categoryData.compliantCount + categoryData.nonCompliantCount;
      categoryData.adherencePercentage = evaluated > 0
        ? (categoryData.compliantCount / evaluated) * 100
        : 0;
    });

    const categoriesReport = Array.from(categoriesMap.values());

    // Montar relatório completo
    const report = {
      audit: {
        id: audit.id,
        performedAt: audit.performedAt,
        performedBy: audit.performedBy,
        measurementPlanVersion: audit.measurementPlanVersion,
        notes: audit.notes,
      },
      summary: {
        totalQuestions,
        compliantCount,
        nonCompliantCount,
        notApplicableCount,
        evaluatedCount,
        overallAdherencePercentage: audit.overallAdherencePercentage,
        totalNonConformities: audit.nonConformities.length,
      },
      categoriesReport,
      answers: audit.answers,
      nonConformities: audit.nonConformities,
    };

    res.json(report);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}
