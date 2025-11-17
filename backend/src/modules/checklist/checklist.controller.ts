import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

export async function getChecklistItems(req: Request, res: Response) {
  try {
    const items = await prisma.checklistItem.findMany({
      orderBy: { code: 'asc' },
    });

    res.json(items);
  } catch (error) {
    console.error('Erro ao buscar itens do checklist:', error);
    res.status(500).json({ error: 'Erro ao buscar itens do checklist' });
  }
}

export async function getChecklistItemById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const item = await prisma.checklistItem.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item do checklist não encontrado' });
    }

    res.json(item);
  } catch (error) {
    console.error('Erro ao buscar item do checklist:', error);
    res.status(500).json({ error: 'Erro ao buscar item do checklist' });
  }
}
