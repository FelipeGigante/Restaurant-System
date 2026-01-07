import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Criar cliente
  const cliente = await prisma.cliente.create({
    data: {
      nome: 'João Silva',
      email: 'joao@exemplo.com',
      telefone: '11999999999',
    },
  })
  console.log('✅ Cliente criado:', cliente.nome)

  // 2. Criar tipo de evento
  const tipoEvento = await prisma.tipoEvento.create({
    data: {
      nome: 'Casamento',
      descricao: 'Eventos de casamento',
    },
  })
  console.log('✅ Tipo de evento criado:', tipoEvento.nome)

  // 3. Criar produtos
  const tomate = await prisma.produto.create({
    data: {
      nome: 'Tomate',
      unidade: 'kg',
      estoqueAtual: 50,
      estoqueMinimo: 10,
    },
  })

  const queijo = await prisma.produto.create({
    data: {
      nome: 'Queijo mussarela',
      unidade: 'kg',
      estoqueAtual: 30,
      estoqueMinimo: 5,
    },
  })

  const picanha = await prisma.produto.create({
    data: {
      nome: 'Picanha',
      unidade: 'kg',
      estoqueAtual: 20,
      estoqueMinimo: 5,
    },
  })

  const guardanapo = await prisma.produto.create({
    data: {
      nome: 'Guardanapo',
      unidade: 'pacote',
      estoqueAtual: 100,
      estoqueMinimo: 20,
    },
  })

  const carvao = await prisma.produto.create({
    data: {
      nome: 'Carvão',
      unidade: 'kg',
      estoqueAtual: 80,
      estoqueMinimo: 15,
    },
  })

  console.log('✅ Produtos criados: 5')

  // 4. Criar assets
  const airfryer = await prisma.asset.create({
    data: {
      nome: 'Airfryer',
      tipo: 'EQUIPAMENTO',
      quantidadeTotal: 3,
      quantidadeDisponivel: 3,
    },
  })

  const churrasqueira = await prisma.asset.create({
    data: {
      nome: 'Churrasqueira portátil',
      tipo: 'EQUIPAMENTO',
      quantidadeTotal: 2,
      quantidadeDisponivel: 2,
    },
  })

  const faca = await prisma.asset.create({
    data: {
      nome: 'Faca do chef',
      tipo: 'UTENSILIO',
      quantidadeTotal: 10,
      quantidadeDisponivel: 10,
    },
  })

  const garfo = await prisma.asset.create({
    data: {
      nome: 'Garfo descartável',
      tipo: 'UTENSILIO',
      quantidadeTotal: 500,
      quantidadeDisponivel: 500,
    },
  })

  const prato = await prisma.asset.create({
    data: {
      nome: 'Prato descartável',
      tipo: 'UTENSILIO',
      quantidadeTotal: 500,
      quantidadeDisponivel: 500,
    },
  })

  console.log('✅ Assets criados: 5')

  // 5. Criar menu
  const menuChurrasco = await prisma.menu.create({
    data: {
      nome: 'Churrasco Premium',
      descricao: 'Menu completo de churrasco com picanha e acompanhamentos',
    },
  })
  console.log('✅ Menu criado:', menuChurrasco.nome)

  // 6. Adicionar produtos ao menu
  await prisma.menuProduto.createMany({
    data: [
      {
        menuId: menuChurrasco.id,
        produtoId: picanha.id,
        quantidadePorPessoa: 0.3, // 300g por pessoa
      },
      {
        menuId: menuChurrasco.id,
        produtoId: tomate.id,
        quantidadePorPessoa: 0.1, // 100g por pessoa
      },
      {
        menuId: menuChurrasco.id,
        produtoId: queijo.id,
        quantidadePorPessoa: 0.05, // 50g por pessoa
      },
      {
        menuId: menuChurrasco.id,
        produtoId: guardanapo.id,
        quantidadePorPessoa: 0.1, // 10% de um pacote por pessoa
      },
      {
        menuId: menuChurrasco.id,
        produtoId: carvao.id,
        quantidadePorPessoa: 0.5, // 500g por pessoa
      },
    ],
  })
  console.log('✅ Produtos adicionados ao menu')

  // 7. Adicionar assets ao menu
  await prisma.menuAsset.createMany({
    data: [
      {
        menuId: menuChurrasco.id,
        assetId: churrasqueira.id,
        tipo: 'PER_EVENT',
        quantidade: 2, // 2 churrasqueiras por evento
      },
      {
        menuId: menuChurrasco.id,
        assetId: faca.id,
        tipo: 'PER_EVENT',
        quantidade: 3, // 3 facas por evento
      },
      {
        menuId: menuChurrasco.id,
        assetId: garfo.id,
        tipo: 'PER_PERSON',
        quantidade: 2, // 2 garfos por pessoa
      },
      {
        menuId: menuChurrasco.id,
        assetId: prato.id,
        tipo: 'PER_PERSON',
        quantidade: 2, // 2 pratos por pessoa
      },
    ],
  })
  console.log('✅ Assets adicionados ao menu')

  // 8. Criar evento de exemplo
  const evento = await prisma.evento.create({
    data: {
      clienteId: cliente.id,
      tipoEventoId: tipoEvento.id,
      menuId: menuChurrasco.id,
      nome: 'Casamento Maria e José',
      data: new Date('2026-03-15T18:00:00'),
      cidade: 'São Paulo',
      participantes: 100,
      status: 'DRAFT',
      valorTotal: 15000,
    },
  })
  console.log('✅ Evento criado:', evento.nome)

  console.log('🎉 Seed concluído com sucesso!')
  console.log('\nDados criados:')
  console.log(`- 1 Cliente: ${cliente.nome}`)
  console.log(`- 1 Tipo de Evento: ${tipoEvento.nome}`)
  console.log(`- 5 Produtos`)
  console.log(`- 5 Assets`)
  console.log(`- 1 Menu: ${menuChurrasco.nome}`)
  console.log(`- 1 Evento: ${evento.nome}`)
  console.log('\nPróximo passo: POST /eventos/:id/planejar para gerar checklists!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
