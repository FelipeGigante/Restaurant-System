# Deploy Rápido - Resumo

Guia condensado para deploy rápido. Para detalhes completos, veja [DEPLOY.md](./DEPLOY.md)

## Backend (Railway)

1. Crie conta em [railway.app](https://railway.app)
2. Novo projeto > Add PostgreSQL
3. Novo serviço > GitHub Repo > Selecione este repositório
4. Configure variáveis:
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   PORT=3000
   NODE_ENV=production
   ```
5. Em Settings > Networking > Generate Domain
6. Execute migrations: `railway run npm run db:migrate`
7. Copie a URL gerada (ex: `https://sistema-restaurante.up.railway.app`)

## Frontend (Vercel)

1. Crie conta em [vercel.com](https://vercel.com)
2. Import Project > Selecione este repositório
3. Configure:
   - **Root Directory**: `web`
   - **Environment Variable**:
     ```env
     NEXT_PUBLIC_API_URL=https://sua-url-railway.up.railway.app
     ```
4. Deploy

## Atualizar CORS no Backend

Edite `src/server.ts` e atualize a configuração do CORS:

```typescript
app.register(cors, {
  origin: [
    'http://localhost:3001',
    'https://seu-projeto.vercel.app',
  ],
  credentials: true,
})
```

Commit e push para atualizar o Railway.

## Testar

1. **Backend**: `https://sua-url-railway.up.railway.app/health`
2. **Frontend**: `https://seu-projeto.vercel.app`

## Custos

- Railway: $5/mês grátis (depois ~$20-30/mês)
- Vercel: Grátis para projetos pessoais

## Problemas?

Veja [DEPLOY.md](./DEPLOY.md) seção Troubleshooting
