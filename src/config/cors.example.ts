/**
 * Exemplo de configuração CORS para produção
 *
 * Para usar, substitua a configuração do CORS em src/server.ts
 */

import { FastifyCorsOptions } from '@fastify/cors';

/**
 * Configuração de CORS segura para produção
 */
export const corsConfig: FastifyCorsOptions = {
  // Lista de origens permitidas
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3001', // Frontend local
      process.env.FRONTEND_URL, // URL da Vercel (configure via env var)
      // Adicione outros domínios se necessário
    ].filter(Boolean) as string[];

    // Se não tem origin (requests do servidor) ou está na lista, permite
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },

  // Permite credenciais (cookies, headers de auth)
  credentials: true,

  // Headers permitidos
  allowedHeaders: ['Content-Type', 'Authorization'],

  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // Tempo de cache do preflight (OPTIONS request)
  maxAge: 86400, // 24 horas
};

/**
 * Configuração simples (desenvolvimento)
 */
export const corsConfigDev: FastifyCorsOptions = {
  origin: true, // Permite qualquer origem
};

/**
 * Usar no server.ts:
 *
 * import { corsConfig, corsConfigDev } from './config/cors.example'
 *
 * const isDev = process.env.NODE_ENV !== 'production'
 * app.register(cors, isDev ? corsConfigDev : corsConfig)
 */
