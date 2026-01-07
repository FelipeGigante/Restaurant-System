import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function assetsRoutes(app: FastifyInstance) {
  // Listar assets
  app.get('/', async (request, reply) => {
    const assets = await prisma.asset.findMany({
      orderBy: { nome: 'asc' },
    })
    return assets
  })

  // Criar asset
  app.post('/', async (request, reply) => {
    const createAssetSchema = z.object({
      nome: z.string(),
      tipo: z.enum(['EQUIPAMENTO', 'UTENSILIO']),
      quantidadeTotal: z.number().int().default(0),
    })

    const data = createAssetSchema.parse(request.body)

    const asset = await prisma.asset.create({
      data: {
        ...data,
        quantidadeDisponivel: data.quantidadeTotal,
      },
    })

    return reply.status(201).send(asset)
  })

  // Buscar asset por ID
  app.get('/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const asset = await prisma.asset.findUnique({
      where: { id },
    })

    if (!asset) {
      return reply.status(404).send({ error: 'Asset não encontrado' })
    }

    return asset
  })

  // Atualizar quantidade total
  app.patch('/:id/quantidade', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const bodySchema = z.object({
      quantidadeTotal: z.number().int(),
    })

    const { id } = paramsSchema.parse(request.params)
    const { quantidadeTotal } = bodySchema.parse(request.body)

    const asset = await prisma.asset.findUnique({ where: { id } })

    if (!asset) {
      return reply.status(404).send({ error: 'Asset não encontrado' })
    }

    const diferenca = quantidadeTotal - asset.quantidadeTotal
    const novaQuantidadeDisponivel = asset.quantidadeDisponivel + diferenca

    const assetAtualizado = await prisma.asset.update({
      where: { id },
      data: {
        quantidadeTotal,
        quantidadeDisponivel: novaQuantidadeDisponivel,
      },
    })

    return assetAtualizado
  })
}
