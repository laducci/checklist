import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import checklistRoutes from './modules/checklist/checklist.routes';
import auditsRoutes from './modules/audits/audits.routes';
import nonConformitiesRoutes from './modules/non-conformities/non-conformities.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API de Auditoria de Qualidade' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/checklist-items', checklistRoutes);
app.use('/api/audits', auditsRoutes);
app.use('/api/non-conformities', nonConformitiesRoutes);

// Tratamento de erros global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
