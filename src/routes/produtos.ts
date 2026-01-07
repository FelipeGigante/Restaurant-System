import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function produtosRoutes(app: FastifyInstance) {
  // Listar produtos
  app.get('/', async (request, reply) => {
    const produtos = await prisma.produto.findMany({
      orderBy: { nome: 'asc' },
    })
    return produtos
  })

  // Criar produto
  app.post('/', async (request, reply) => {
    const createProdutoSchema = z.object({
      nome: z.string(),
      unidade: z.string(),
      estoqueAtual: z.number().default(0),
      estoqueMinimo: z.number().default(0),
    })

    const data = createProdutoSchema.parse(request.body)

    const produto = await prisma.produto.create({
      data,
    })

    return reply.status(201).send(produto)
  })

  // Buscar produto por ID
  app.get('/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const produto = await prisma.produto.findUnique({
      where: { id },
    })

    if (!produto) {
      return reply.status(404).send({ error: 'Produto não encontrado' })
    }

    return produto
  })

  // Atualizar estoque
  app.patch('/:id/estoque', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      quantidade: z.number(),
      tipo: z.enum(['ENTRADA', 'SAIDA', 'AJUSTE']),
      observacao: z.string().optional(),
    })

    const { id } = paramsSchema.parse(request.params)
    const { quantidade, tipo, observacao } = bodySchema.parse(request.body)

    const produto = await prisma.produto.findUnique({ where: { id } })

    if (!produto) {
      return reply.status(404).send({ error: 'Produto não encontrado' })
    }

    let novoEstoque = produto.estoqueAtual

    if (tipo === 'ENTRADA' || tipo === 'AJUSTE') {
      novoEstoque = quantidade
    } else if (tipo === 'SAIDA') {
      novoEstoque = produto.estoqueAtual - quantidade
    }

    const [produtoAtualizado] = await prisma.$transaction([
      prisma.produto.update({
        where: { id },
        data: { estoqueAtual: novoEstoque },
      }),
      prisma.movimentacao.create({
        data: {
          produtoId: id,
          tipo,
          quantidade,
          observacao,
        },
      }),
    ])

    return produtoAtualizado
  })
}
