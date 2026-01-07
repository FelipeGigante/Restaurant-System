import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function planejamentoRoutes(app: FastifyInstance) {
  // Planejar evento (CORE DO SISTEMA)
  app.post('/eventos/:eventoId/planejar', async (request, reply) => {
    const paramsSchema = z.object({
      eventoId: z.string().uuid(),
    })

    const { eventoId } = paramsSchema.parse(request.params)

    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      include: {
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
      },
    })

    if (!evento) {
      return reply.status(404).send({ error: 'Evento não encontrado' })
    }

    if (!evento.menu) {
      return reply.status(400).send({ error: 'Evento sem menu definido' })
    }

    if (!evento.participantes || evento.participantes === 0) {
      return reply.status(400).send({ error: 'Evento sem participantes definidos' })
    }

    const participantes = evento.participantes

    // 1. CALCULAR NECESSIDADES DE PRODUTOS
    const necessidadesProdutos = evento.menu.produtos.map((mp) => {
      const quantidadeNecessaria = mp.quantidadePorPessoa * participantes
      const estoqueAtual = mp.produto.estoqueAtual
      const faltante = Math.max(0, quantidadeNecessaria - estoqueAtual)

      return {
        produtoId: mp.produtoId,
        produtoNome: mp.produto.nome,
        unidade: mp.produto.unidade,
        quantidadeNecessaria,
        estoqueAtual,
        faltante,
      }
    })

    // 2. CALCULAR NECESSIDADES DE ASSETS
    const necessidadesAssets = evento.menu.assets.map((ma) => {
      const quantidadeNecessaria =
        ma.tipo === 'PER_PERSON'
          ? ma.quantidade * participantes
          : ma.quantidade

      const disponivel = ma.asset.quantidadeDisponivel

      return {
        assetId: ma.assetId,
        assetNome: ma.asset.nome,
        tipo: ma.asset.tipo,
        quantidadeNecessaria,
        disponivel,
        faltante: Math.max(0, quantidadeNecessaria - disponivel),
      }
    })

    // 3. CRIAR RESERVAS E ALOCAÇÕES
    await prisma.$transaction(async (tx) => {
      // Limpar reservas/alocações antigas (se replanejar)
      await tx.reserva.deleteMany({
        where: { eventoId },
      })
      await tx.alocacao.deleteMany({
        where: { eventoId },
      })

      // Criar reservas de produtos
      for (const nec of necessidadesProdutos) {
        const quantidadeReservar = Math.min(
          nec.quantidadeNecessaria,
          nec.estoqueAtual
        )

        if (quantidadeReservar > 0) {
          await tx.reserva.create({
            data: {
              eventoId,
              produtoId: nec.produtoId,
              quantidadeReservada: quantidadeReservar,
            },
          })
        }
      }

      // Criar alocações de assets
      for (const nec of necessidadesAssets) {
        const quantidadeAlocar = Math.min(
          nec.quantidadeNecessaria,
          nec.disponivel
        )

        if (quantidadeAlocar > 0) {
          await tx.alocacao.create({
            data: {
              eventoId,
              assetId: nec.assetId,
              quantidadeAlocada: quantidadeAlocar,
            },
          })

          // Reduzir disponibilidade do asset
          await tx.asset.update({
            where: { id: nec.assetId },
            data: {
              quantidadeDisponivel: {
                decrement: quantidadeAlocar,
              },
            },
          })
        }
      }

      // Atualizar status do evento
      await tx.evento.update({
        where: { id: eventoId },
        data: { status: 'PLANNED' },
      })
    })

    // 4. GERAR CHECKLISTS
    const checklistCompras = necessidadesProdutos
      .filter((n) => n.faltante > 0)
      .map((n) => ({
        produto: n.produtoNome,
        quantidade: n.faltante,
        unidade: n.unidade,
      }))

    const checklistLevar = {
      produtos: necessidadesProdutos.map((n) => ({
        produto: n.produtoNome,
        quantidade: Math.min(n.quantidadeNecessaria, n.estoqueAtual),
        unidade: n.unidade,
      })),
      assets: necessidadesAssets.map((n) => ({
        asset: n.assetNome,
        tipo: n.tipo,
        quantidade: Math.min(n.quantidadeNecessaria, n.disponivel),
      })),
    }

    const warnings = [
      ...necessidadesProdutos
        .filter((n) => n.faltante > 0)
        .map((n) => `Estoque insuficiente de ${n.produtoNome}: faltam ${n.faltante} ${n.unidade}`),
      ...necessidadesAssets
        .filter((n) => n.faltante > 0)
        .map((n) => `Assets insuficientes de ${n.assetNome}: faltam ${n.faltante} unidades`),
    ]

    return {
      eventoId,
      status: 'PLANNED',
      participantes,
      checklistCompras,
      checklistLevar,
      warnings,
    }
  })

  // Fechar evento
  app.post('/eventos/:eventoId/fechar', async (request, reply) => {
    const paramsSchema = z.object({
      eventoId: z.string().uuid(),
    })

    const bodySchema = z.object({
      sobras: z.array(
        z.object({
          produtoId: z.string().uuid(),
          quantidade: z.number(),
        })
      ).optional().default([]),
      perdas: z.array(
        z.object({
          assetId: z.string().uuid(),
          quantidade: z.number().int(),
        })
      ).optional().default([]),
    })

    const { eventoId } = paramsSchema.parse(request.params)
    const { sobras, perdas } = bodySchema.parse(request.body)

    const evento = await prisma.evento.findUnique({
      where: { id: eventoId },
      include: {
        reservas: true,
        alocacoes: true,
      },
    })

    if (!evento) {
      return reply.status(404).send({ error: 'Evento não encontrado' })
    }

    if (evento.status !== 'PLANNED' && evento.status !== 'IN_PROGRESS') {
      return reply.status(400).send({ error: 'Evento não está em andamento' })
    }

    await prisma.$transaction(async (tx) => {
      // 1. PROCESSAR RESERVAS (consumo real)
      for (const reserva of evento.reservas) {
        const sobra = sobras.find((s) => s.produtoId === reserva.produtoId)
        const quantidadeRetornada = sobra?.quantidade || 0
        const quantidadeConsumida = reserva.quantidadeReservada - quantidadeRetornada

        // Atualizar reserva
        await tx.reserva.update({
          where: { id: reserva.id },
          data: {
            quantidadeConsumida,
            quantidadeRetornada,
          },
        })

        // Reduzir estoque (consumo)
        await tx.produto.update({
          where: { id: reserva.produtoId },
          data: {
            estoqueAtual: {
              decrement: quantidadeConsumida,
            },
          },
        })

        // Registrar movimentação de consumo
        if (quantidadeConsumida > 0) {
          await tx.movimentacao.create({
            data: {
              produtoId: reserva.produtoId,
              tipo: 'CONSUMO',
              quantidade: quantidadeConsumida,
              eventoId,
            },
          })
        }

        // Retornar sobras ao estoque (se houver)
        if (quantidadeRetornada > 0) {
          await tx.movimentacao.create({
            data: {
              produtoId: reserva.produtoId,
              tipo: 'RETORNO',
              quantidade: quantidadeRetornada,
              eventoId,
            },
          })
        }
      }

      // 2. PROCESSAR ALOCAÇÕES DE ASSETS
      for (const alocacao of evento.alocacoes) {
        const perda = perdas.find((p) => p.assetId === alocacao.assetId)
        const quantidadePerdida = perda?.quantidade || 0

        // Atualizar alocação
        await tx.alocacao.update({
          where: { id: alocacao.id },
          data: { quantidadePerdida },
        })

        // Devolver assets disponíveis (menos as perdas)
        const quantidadeDevolvida = alocacao.quantidadeAlocada - quantidadePerdida

        await tx.asset.update({
          where: { id: alocacao.assetId },
          data: {
            quantidadeDisponivel: {
              increment: quantidadeDevolvida,
            },
            quantidadeTotal: {
              decrement: quantidadePerdida, // Perdas reduzem total
            },
          },
        })
      }

      // 3. FECHAR EVENTO
      await tx.evento.update({
        where: { id: eventoId },
        data: { status: 'CLOSED' },
      })
    })

    return {
      eventoId,
      status: 'CLOSED',
      message: 'Evento fechado com sucesso',
    }
  })
}
