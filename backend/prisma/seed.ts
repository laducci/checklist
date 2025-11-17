import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuários iniciais
  console.log('📝 Criando usuários...');
  const auditor = await prisma.user.upsert({
    where: { email: 'auditor@qualidade.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'auditor@qualidade.com',
      password: 'senha123', // Em produção, usar hash
      role: UserRole.AUDITOR,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'gerente@qualidade.com' },
    update: {},
    create: {
      name: 'Maria Santos',
      email: 'gerente@qualidade.com',
      password: 'senha123', // Em produção, usar hash
      role: UserRole.QUALITY_MANAGER,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'visualizador@qualidade.com' },
    update: {},
    create: {
      name: 'Carlos Oliveira',
      email: 'visualizador@qualidade.com',
      password: 'senha123', // Em produção, usar hash
      role: UserRole.VIEWER,
    },
  });

  console.log(`✅ Usuários criados: ${auditor.name}, ${manager.name}, ${viewer.name}`);

  // Criar itens do checklist baseados no Plano de Medição
  console.log('📋 Criando itens do checklist...');
  
  const checklistItems = [
    {
      code: 'MP-01',
      title: 'Objetivos de medição documentados',
      description: 'Os objetivos de medição estão claramente documentados e alinhados com as metas do projeto.',
    },
    {
      code: 'MP-02',
      title: 'Definições operacionais das métricas',
      description: 'Todas as métricas definidas possuem definições operacionais precisas.',
    },
    {
      code: 'MP-03',
      title: 'Fonte de dados identificada',
      description: 'Cada métrica possui uma fonte de dados identificada.',
    },
    {
      code: 'MP-04',
      title: 'Procedimentos de coleta documentados',
      description: 'Os procedimentos de coleta para cada métrica estão documentados.',
    },
    {
      code: 'MP-05',
      title: 'Frequência de coleta definida',
      description: 'A frequência de coleta de dados está definida para cada métrica.',
    },
    {
      code: 'MP-06',
      title: 'Responsáveis pela coleta documentados',
      description: 'Os papéis responsáveis pela coleta de dados estão documentados.',
    },
    {
      code: 'MP-07',
      title: 'Mecanismos de verificação da qualidade dos dados',
      description: 'Existem mecanismos para verificar a qualidade e consistência dos dados.',
    },
    {
      code: 'MP-08',
      title: 'Processo de análise definido',
      description: 'Existe um processo definido para analisar as métricas coletadas.',
    },
    {
      code: 'MP-09',
      title: 'Comunicação dos resultados',
      description: 'Os resultados de medição são comunicados às partes interessadas relevantes.',
    },
    {
      code: 'MP-10',
      title: 'Registro de ações baseadas em medições',
      description: 'Ações ou decisões baseadas nos resultados de medição são registradas.',
    },
    {
      code: 'MP-11',
      title: 'Revisão periódica do plano',
      description: 'O plano de medição é revisado e atualizado periodicamente.',
    },
    {
      code: 'MP-12',
      title: 'Ferramentas de medição identificadas',
      description: 'As ferramentas utilizadas para medição estão identificadas e documentadas.',
    },
    {
      code: 'MP-13',
      title: 'Rastreabilidade com objetivos e riscos',
      description: 'Existe rastreabilidade entre os objetivos de medição e os riscos ou metas de qualidade do projeto.',
    },
    {
      code: 'MP-14',
      title: 'Armazenamento de dados históricos',
      description: 'Existe evidência de que dados históricos de medição estão sendo armazenados.',
    },
    {
      code: 'MP-15',
      title: 'Caminho de escalação definido',
      description: 'Existe um caminho de escalação definido para métricas fora das faixas alvo.',
    },
  ];

  for (const item of checklistItems) {
    await prisma.checklistItem.upsert({
      where: { code: item.code },
      update: {},
      create: item,
    });
  }

  console.log(`✅ ${checklistItems.length} itens de checklist criados`);
  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
