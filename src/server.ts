import Fastify from 'fastify'
import cors from '@fastify/cors'
import { produtosRoutes } from './routes/produtos'
import { assetsRoutes } from './routes/assets'
import { menusRoutes } from './routes/menus'
import { eventosRoutes } from './routes/eventos'
import { clientesRoutes } from './routes/clientes'
import { planejamentoRoutes } from './routes/planejamento'

const app = Fastify({
  logger: true,
})

app.register(cors, {
  origin: [
    'http://localhost:3001',
    'https://restaurant-system-swart.vercel.app',
  ],
  credentials: true
});

// Registrar rotas
app.register(produtosRoutes, { prefix: '/produtos' })
app.register(assetsRoutes, { prefix: '/assets' })
app.register(menusRoutes, { prefix: '/menus' })
app.register(eventosRoutes, { prefix: '/eventos' })
app.register(clientesRoutes, { prefix: '/clientes' })
app.register(planejamentoRoutes)

app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`🚀 Server running on http://localhost:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
