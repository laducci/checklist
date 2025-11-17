import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Atualizando checklist...');

  // Remove todos os itens antigos
  await prisma.checklistItem.deleteMany({});
  console.log('✅ Itens antigos removidos');

  // Cria os novos 38 itens baseados no Guia MA
  const items = [
    // MA SP 1.1 — Estabelecimento dos Objetivos de Medição
    {
      code: 'MA-1.1-01',
      title: 'Objetivos Documentados',
      description: 'Os objetivos das medições estão claramente documentados?',
      category: 'MA SP 1.1 - Estabelecimento dos Objetivos de Medição',
      order: 1
    },
    {
      code: 'MA-1.1-02',
      title: 'Alinhamento com Necessidades',
      description: 'Os objetivos das medições estão alinhados às necessidades de informação do projeto?',
      category: 'MA SP 1.1 - Estabelecimento dos Objetivos de Medição',
      order: 2
    },
    {
      code: 'MA-1.1-03',
      title: 'Derivação Estratégica',
      description: 'Os objetivos de medição derivam dos objetivos estratégicos organizacionais?',
      category: 'MA SP 1.1 - Estabelecimento dos Objetivos de Medição',
      order: 3
    },
    {
      code: 'MA-1.1-04',
      title: 'Necessidades Registradas',
      description: 'As necessidades de informação foram identificadas e registradas?',
      category: 'MA SP 1.1 - Estabelecimento dos Objetivos de Medição',
      order: 4
    },
    {
      code: 'MA-1.1-05',
      title: 'Processo Documentado',
      description: 'O processo de definição dos objetivos foi documentado?',
      category: 'MA SP 1.1 - Estabelecimento dos Objetivos de Medição',
      order: 5
    },
    {
      code: 'MA-1.1-06',
      title: 'Armazenamento Definido',
      description: 'A forma de armazenamento dos artefatos de medição está definida?',
      category: 'MA SP 1.1 - Estabelecimento dos Objetivos de Medição',
      order: 6
    },
    
    // MA SP 1.2 — Especificação das Medidas
    {
      code: 'MA-1.2-01',
      title: 'Medidas Especificadas',
      description: 'Todas as medidas básicas e derivadas foram especificadas?',
      category: 'MA SP 1.2 - Especificação das Medidas',
      order: 7
    },
    {
      code: 'MA-1.2-02',
      title: 'Definição Operacional',
      description: 'Cada medida possui definição operacional clara e não ambígua?',
      category: 'MA SP 1.2 - Especificação das Medidas',
      order: 8
    },
    {
      code: 'MA-1.2-03',
      title: 'Critérios de Repetibilidade',
      description: 'As medidas possuem critérios de repetibilidade definidos?',
      category: 'MA SP 1.2 - Especificação das Medidas',
      order: 9
    },
    {
      code: 'MA-1.2-04',
      title: 'Descrição Completa',
      description: 'Está descrito o que será medido, como será medido e a unidade de medida?',
      category: 'MA SP 1.2 - Especificação das Medidas',
      order: 10
    },
    {
      code: 'MA-1.2-05',
      title: 'Coerência com Objetivos',
      description: 'As medidas especificadas estão coerentes com os objetivos de medição?',
      category: 'MA SP 1.2 - Especificação das Medidas',
      order: 11
    },
    {
      code: 'MA-1.2-06',
      title: 'Documentação Enviada',
      description: 'A documentação das métricas foi enviada ao GQA ou responsável?',
      category: 'MA SP 1.2 - Especificação das Medidas',
      order: 12
    },
    
    // MA SP 1.3 — Procedimentos de Coleta e Armazenamento
    {
      code: 'MA-1.3-01',
      title: 'Procedimentos Formalizados',
      description: 'Os procedimentos de coleta estão formalizados?',
      category: 'MA SP 1.3 - Procedimentos de Coleta e Armazenamento',
      order: 13
    },
    {
      code: 'MA-1.3-02',
      title: 'Fontes Identificadas',
      description: 'As fontes de dados para coleta estão identificadas?',
      category: 'MA SP 1.3 - Procedimentos de Coleta e Armazenamento',
      order: 14
    },
    {
      code: 'MA-1.3-03',
      title: 'Ferramentas Definidas',
      description: 'As ferramentas de coleta foram definidas?',
      category: 'MA SP 1.3 - Procedimentos de Coleta e Armazenamento',
      order: 15
    },
    {
      code: 'MA-1.3-04',
      title: 'Responsável pela Obtenção',
      description: 'Há responsável designado para obtenção de cada dado?',
      category: 'MA SP 1.3 - Procedimentos de Coleta e Armazenamento',
      order: 16
    },
    {
      code: 'MA-1.3-05',
      title: 'Responsável pelo Armazenamento',
      description: 'Há responsável definido pelo armazenamento e segurança dos dados?',
      category: 'MA SP 1.3 - Procedimentos de Coleta e Armazenamento',
      order: 17
    },
    {
      code: 'MA-1.3-06',
      title: 'Atualização dos Procedimentos',
      description: 'Os procedimentos de coleta são atualizados quando necessário?',
      category: 'MA SP 1.3 - Procedimentos de Coleta e Armazenamento',
      order: 18
    },
    
    // MA SP 1.4 — Procedimentos de Análise
    {
      code: 'MA-1.4-01',
      title: 'Procedimentos Documentados',
      description: 'Os procedimentos de análise estão documentados?',
      category: 'MA SP 1.4 - Procedimentos de Análise',
      order: 19
    },
    {
      code: 'MA-1.4-02',
      title: 'Técnicas e Ferramentas',
      description: 'As técnicas, ferramentas e modelos de análise estão definidos?',
      category: 'MA SP 1.4 - Procedimentos de Análise',
      order: 20
    },
    {
      code: 'MA-1.4-03',
      title: 'Atendimento aos Objetivos',
      description: 'Os procedimentos de análise atendem aos objetivos de medição?',
      category: 'MA SP 1.4 - Procedimentos de Análise',
      order: 21
    },
    {
      code: 'MA-1.4-04',
      title: 'Apresentação Clara',
      description: 'Os resultados são apresentados de forma clara aos stakeholders?',
      category: 'MA SP 1.4 - Procedimentos de Análise',
      order: 22
    },
    {
      code: 'MA-1.4-05',
      title: 'Responsáveis Definidos',
      description: 'Os responsáveis pela análise estão definidos?',
      category: 'MA SP 1.4 - Procedimentos de Análise',
      order: 23
    },
    {
      code: 'MA-1.4-06',
      title: 'Periodicidade Cumprida',
      description: 'A periodicidade das análises está definida e sendo cumprida?',
      category: 'MA SP 1.4 - Procedimentos de Análise',
      order: 24
    },
    {
      code: 'MA-1.4-07',
      title: 'Comunicação Adequada',
      description: 'A comunicação das análises segue a forma e periodicidade definidas?',
      category: 'MA SP 1.4 - Procedimentos de Análise',
      order: 25
    },
    
    // Métricas (Seção 6)
    {
      code: 'MA-MET-01',
      title: 'Cálculo Conforme Definido',
      description: 'O cálculo das métricas derivadas é realizado conforme definido?',
      category: 'Métricas',
      order: 26
    },
    {
      code: 'MA-MET-02',
      title: 'Métricas Básicas Disponíveis',
      description: 'As métricas básicas necessárias estão coletadas e disponíveis?',
      category: 'Métricas',
      order: 27
    },
    {
      code: 'MA-MET-03',
      title: 'Análise de Variações',
      description: 'Há análise das variações entre valores previstos e realizados?',
      category: 'Métricas',
      order: 28
    },
    {
      code: 'MA-MET-04',
      title: 'Limites e Metas',
      description: 'Limites, metas e tolerâncias das métricas estão definidos?',
      category: 'Métricas',
      order: 29
    },
    {
      code: 'MA-MET-05',
      title: 'Ações Corretivas',
      description: 'Ações corretivas são propostas quando limites são excedidos?',
      category: 'Métricas',
      order: 30
    },
    
    // Documentação de Métricas (Seção 8)
    {
      code: 'MA-DOC-01',
      title: 'Descrição Completa',
      description: 'A descrição da métrica inclui finalidade, coleta e análise?',
      category: 'Documentação de Métricas',
      order: 31
    },
    {
      code: 'MA-DOC-02',
      title: 'Classificação Correta',
      description: 'A classificação básica/derivada está correta?',
      category: 'Documentação de Métricas',
      order: 32
    },
    {
      code: 'MA-DOC-03',
      title: 'Unidade de Medida',
      description: 'A unidade de medida está definida adequadamente?',
      category: 'Documentação de Métricas',
      order: 33
    },
    {
      code: 'MA-DOC-04',
      title: 'Responsáveis Especificados',
      description: 'Os responsáveis por coleta, análise e armazenamento estão especificados?',
      category: 'Documentação de Métricas',
      order: 34
    },
    {
      code: 'MA-DOC-05',
      title: 'Algoritmo Documentado',
      description: 'O algoritmo/cálculo da métrica está documentado de forma replicável?',
      category: 'Documentação de Métricas',
      order: 35
    },
    
    // Ciclo de Aprovação (Seção 9)
    {
      code: 'MA-APR-01',
      title: 'Elaboração Qualificada',
      description: 'A métrica foi elaborada por responsável qualificado?',
      category: 'Ciclo de Aprovação',
      order: 36
    },
    {
      code: 'MA-APR-02',
      title: 'Registro de Aprovação',
      description: 'Há registro de revisão e aprovação?',
      category: 'Ciclo de Aprovação',
      order: 37
    },
    {
      code: 'MA-APR-03',
      title: 'Histórico de Alterações',
      description: 'A versão atual e histórico de alterações estão documentados?',
      category: 'Ciclo de Aprovação',
      order: 38
    }
  ];

  // Cria todos os itens
  for (const item of items) {
    await prisma.checklistItem.create({
      data: item
    });
  }

  console.log(`✅ ${items.length} itens de checklist criados com sucesso!`);
  console.log('\n📋 Categorias:');
  console.log('  - MA SP 1.1 - Estabelecimento dos Objetivos de Medição (6 itens)');
  console.log('  - MA SP 1.2 - Especificação das Medidas (6 itens)');
  console.log('  - MA SP 1.3 - Procedimentos de Coleta e Armazenamento (6 itens)');
  console.log('  - MA SP 1.4 - Procedimentos de Análise (7 itens)');
  console.log('  - Métricas (5 itens)');
  console.log('  - Documentação de Métricas (5 itens)');
  console.log('  - Ciclo de Aprovação (3 itens)');
  console.log('\n🎉 Atualização concluída!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
