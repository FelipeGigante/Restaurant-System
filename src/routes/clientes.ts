import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function clientesRoutes(app: FastifyInstance) {
  // Listar clientes
  app.get('/', async (request, reply) => {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
    })
    return clientes
  })

  // Criar cliente
  app.post('/', async (request, reply) => {
    const createClienteSchema = z.object({
      nome: z.string(),
      email: z.string().email().optional(),
      telefone: z.string().optional(),
    })

    const data = createClienteSchema.parse(request.body)

    const cliente = await prisma.cliente.create({
      data,
    })

    return reply.status(201).send(cliente)
  })

  // Buscar cliente por ID
  app.get('/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        eventos: true,
      },
    })

    if (!cliente) {
      return reply.status(404).send({ error: 'Cliente não encontrado' })
    }

    return cliente
  })
}
