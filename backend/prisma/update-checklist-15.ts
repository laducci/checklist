import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Atualizando checklist para 15 critérios...');

  // Remove auditorias e respostas primeiro (CASCADE)
  console.log('⚠️  Deletando auditorias antigas...');
  await prisma.audit.deleteMany({});
  
  // Agora pode remover os itens
  await prisma.checklistItem.deleteMany({});
  console.log('✅ Itens antigos removidos');

  // Cria os novos 15 itens baseados nos blocos de avaliação
  const items = [
    // BLOCO 1 – Estabelecimento dos Objetivos de Medição
    {
      code: '1',
      title: 'Clareza dos Objetivos',
      description: 'Os objetivos de medição foram definidos de maneira clara e compreensível?',
      category: 'BLOCO 1 - Estabelecimento dos Objetivos de Medição',
      order: 1
    },
    {
      code: '2',
      title: 'Atendimento às Necessidades',
      description: 'Esses objetivos realmente atendem às necessidades de informação do projeto?',
      category: 'BLOCO 1 - Estabelecimento dos Objetivos de Medição',
      order: 2
    },
    {
      code: '3',
      title: 'Alinhamento Estratégico',
      description: 'Os objetivos de medição estão alinhados aos objetivos estratégicos da organização?',
      category: 'BLOCO 1 - Estabelecimento dos Objetivos de Medição',
      order: 3
    },
    {
      code: '4',
      title: 'Registro do Processo',
      description: 'O processo de definição dos objetivos foi devidamente registrado?',
      category: 'BLOCO 1 - Estabelecimento dos Objetivos de Medição',
      order: 4
    },
    
    // BLOCO 2 – Especificação das Medidas
    {
      code: '5',
      title: 'Adequação das Medidas',
      description: 'As medidas escolhidas (básicas e derivadas) fazem sentido para os objetivos definidos?',
      category: 'BLOCO 2 - Especificação das Medidas',
      order: 5
    },
    {
      code: '6',
      title: 'Definição Operacional',
      description: 'Cada medida possui uma definição operacional clara e repetível?',
      category: 'BLOCO 2 - Especificação das Medidas',
      order: 6
    },
    {
      code: '7',
      title: 'Unidades e Cálculos',
      description: 'As unidades de medida e forma de cálculo estão definidas corretamente?',
      category: 'BLOCO 2 - Especificação das Medidas',
      order: 7
    },
    {
      code: '8',
      title: 'Documentação e Comunicação',
      description: 'As medidas foram documentadas e comunicadas às partes responsáveis?',
      category: 'BLOCO 2 - Especificação das Medidas',
      order: 8
    },
    
    // BLOCO 3 – Coleta e Armazenamento dos Dados
    {
      code: '9',
      title: 'Identificação das Fontes',
      description: 'As fontes de dados necessárias para a coleta estão claramente identificadas?',
      category: 'BLOCO 3 - Coleta e Armazenamento dos Dados',
      order: 9
    },
    {
      code: '10',
      title: 'Procedimento de Coleta',
      description: 'Existe um procedimento consistente para coleta das medições?',
      category: 'BLOCO 3 - Coleta e Armazenamento dos Dados',
      order: 10
    },
    {
      code: '11',
      title: 'Responsabilidades Definidas',
      description: 'As responsabilidades pela coleta e armazenamento estão atribuídas e documentadas?',
      category: 'BLOCO 3 - Coleta e Armazenamento dos Dados',
      order: 11
    },
    {
      code: '12',
      title: 'Controle e Segurança',
      description: 'Há controle adequado sobre a segurança, organização e atualização dos dados coletados?',
      category: 'BLOCO 3 - Coleta e Armazenamento dos Dados',
      order: 12
    },
    
    // BLOCO 4 – Análise, Interpretação e Comunicação
    {
      code: '13',
      title: 'Procedimentos de Análise',
      description: 'Os procedimentos de análise das medições estão bem definidos?',
      category: 'BLOCO 4 - Análise, Interpretação e Comunicação',
      order: 13
    },
    {
      code: '14',
      title: 'Apresentação dos Resultados',
      description: 'Os resultados das medições são analisados e apresentados de forma clara aos interessados?',
      category: 'BLOCO 4 - Análise, Interpretação e Comunicação',
      order: 14
    },
    {
      code: '15',
      title: 'Prazo e Formato',
      description: 'A comunicação das análises ocorre dentro do prazo e no formato estabelecido?',
      category: 'BLOCO 4 - Análise, Interpretação e Comunicação',
      order: 15
    }
  ];

  // Cria todos os itens
  for (const item of items) {
    await prisma.checklistItem.create({
      data: item
    });
  }

  console.log(`✅ ${items.length} itens de checklist criados com sucesso!`);
  console.log('\n📋 Blocos:');
  console.log('  - BLOCO 1 - Estabelecimento dos Objetivos de Medição (4 itens)');
  console.log('  - BLOCO 2 - Especificação das Medidas (4 itens)');
  console.log('  - BLOCO 3 - Coleta e Armazenamento dos Dados (4 itens)');
  console.log('  - BLOCO 4 - Análise, Interpretação e Comunicação (3 itens)');
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
