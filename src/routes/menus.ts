import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function menusRoutes(app: FastifyInstance) {
  // Listar menus
  app.get('/', async (request, reply) => {
    const menus = await prisma.menu.findMany({
      include: {
        produtos: {
          include: {
            produto: true,
          },
        },
        assets: {
          include: {
            asset: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    })
    return menus
  })

  // Criar menu
  app.post('/', async (request, reply) => {
    const createMenuSchema = z.object({
      nome: z.string(),
      descricao: z.string().optional(),
    })

    const data = createMenuSchema.parse(request.body)

    const menu = await prisma.menu.create({
      data,
    })

    return reply.status(201).send(menu)
  })

  // Buscar menu por ID
  app.get('/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        produtos: {
          include: {
            produto: true,
          },
        },
        assets: {
          include: {
            asset: true,
          },
        },
      },
    })

    if (!menu) {
      return reply.status(404).send({ error: 'Menu não encontrado' })
    }

    return menu
  })

  // Adicionar produto ao menu
  app.post('/:menuId/produtos', async (request, reply) => {
    const paramsSchema = z.object({
      menuId: z.string().uuid(),
    })

    const bodySchema = z.object({
      produtoId: z.string().uuid(),
      quantidadePorPessoa: z.number().positive(),
    })

    const { menuId } = paramsSchema.parse(request.params)
    const data = bodySchema.parse(request.body)

    const menuProduto = await prisma.menuProduto.create({
      data: {
        menuId,
        ...data,
      },
      include: {
        produto: true,
      },
    })

    return reply.status(201).send(menuProduto)
  })

  // Adicionar asset ao menu
  app.post('/:menuId/assets', async (request, reply) => {
    const paramsSchema = z.object({
      menuId: z.string().uuid(),
    })

    const bodySchema = z.object({
      assetId: z.string().uuid(),
      tipo: z.enum(['PER_EVENT', 'PER_PERSON']),
      quantidade: z.number().int().positive().default(1),
    })

    const { menuId } = paramsSchema.parse(request.params)
    const data = bodySchema.parse(request.body)

    const menuAsset = await prisma.menuAsset.create({
      data: {
        menuId,
        ...data,
      },
      include: {
        asset: true,
      },
    })

    return reply.status(201).send(menuAsset)
  })
}
