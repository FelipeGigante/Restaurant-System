import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function eventosRoutes(app: FastifyInstance) {
  // Listar eventos
  app.get('/', async (request, reply) => {
    const eventos = await prisma.evento.findMany({
      include: {
        cliente: true,
        menu: true,
        tipoEvento: true,
      },
      orderBy: { data: 'desc' },
    })
    return eventos
  })

  // Criar evento
  app.post('/', async (request, reply) => {
    const createEventoSchema = z.object({
      clienteId: z.string().uuid(),
      nome: z.string(),
      data: z.string().transform((val) => new Date(val)),
      cidade: z.string().optional(),
      tipoEventoId: z.string().uuid().optional(),
    })

    const data = createEventoSchema.parse(request.body)

    const evento = await prisma.evento.create({
      data,
      include: {
        cliente: true,
      },
    })

    return reply.status(201).send(evento)
  })

  // Buscar evento por ID
  app.get('/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        cliente: true,
        menu: {
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
        },
        tipoEvento: true,
        reservas: {
          include: {
            produto: true,
          },
        },
        alocacoes: {
          include: {
            asset: true,
          },
        },
      },
    })

    if (!evento) {
      return reply.status(404).send({ error: 'Evento não encontrado' })
    }

    return evento
  })

  // Atualizar evento
  app.patch('/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const updateEventoSchema = z.object({
      menuId: z.string().uuid().optional(),
      participantes: z.number().int().positive().optional(),
      data: z.string().transform((val) => new Date(val)).optional(),
      cidade: z.string().optional(),
      status: z.enum(['DRAFT', 'PLANNED', 'IN_PROGRESS', 'CLOSED', 'CANCELED']).optional(),
      valorTotal: z.number().optional(),
    })

    const { id } = paramsSchema.parse(request.params)
    const data = updateEventoSchema.parse(request.body)

    const evento = await prisma.evento.update({
      where: { id },
      data,
      include: {
        cliente: true,
        menu: true,
      },
    })

    return evento
  })
}
