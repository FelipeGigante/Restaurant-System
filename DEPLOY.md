# Guia de Deploy - Sistema de Gestão para Buffet

Este guia mostra como fazer deploy completo da aplicação, com frontend na Vercel e backend no Railway.

## Arquitetura do Deploy

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Vercel    │ ──────> │   Railway   │ ──────> │  PostgreSQL  │
│  (Next.js)  │  API    │  (Fastify)  │  DB     │  (Railway)   │
└─────────────┘         └─────────────┘         └──────────────┘
```

---

## Parte 1: Deploy do Backend (Railway)

### 1.1. Criar conta no Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em "New Project"

### 1.2. Criar banco de dados PostgreSQL

1. No projeto, clique em "+ New"
2. Selecione "Database" > "Add PostgreSQL"
3. Aguarde a criação do banco
4. Clique no serviço PostgreSQL criado
5. Vá na aba "Variables" e copie a `DATABASE_URL`

Exemplo de DATABASE_URL:
```
postgresql://postgres:senha@containers.railway.app:5432/railway
```

### 1.3. Deploy do Backend

#### Opção A: Deploy via GitHub (Recomendado)

1. Faça push do seu código para o GitHub (se ainda não fez)
2. No Railway, clique em "+ New" > "GitHub Repo"
3. Selecione o repositório `Sistema-Restaurante`
4. Railway detectará automaticamente o projeto Node.js

#### Opção B: Deploy via Railway CLI

```bash
# Instalar CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Deploy
railway up
```

### 1.4. Configurar variáveis de ambiente no Railway

1. Clique no serviço do backend
2. Vá em "Variables"
3. Adicione as seguintes variáveis:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
PORT=3000
NODE_ENV=production
```

**Nota**: `${{Postgres.DATABASE_URL}}` é uma referência automática ao banco que você criou

### 1.5. Configurar Root Directory no Railway

Se o Railway não detectar automaticamente:

1. Vá em "Settings"
2. Em "Build & Deploy"
3. Configure:
   - **Root Directory**: `/` (raiz do projeto)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### 1.6. Executar Migrations

Após o primeiro deploy:

```bash
# Via Railway CLI
railway run npm run db:migrate

# Ou conecte ao banco localmente e execute
DATABASE_URL="sua-url-do-railway" npm run db:migrate
```

### 1.7. (Opcional) Popular banco com dados de exemplo

```bash
railway run npm run db:seed
```

### 1.8. Obter URL pública do backend

1. No serviço backend, vá em "Settings"
2. Em "Networking" > "Public Networking"
3. Clique em "Generate Domain"
4. Copie a URL gerada (ex: `https://sistema-restaurante-production.up.railway.app`)

---

## Parte 2: Deploy do Frontend (Vercel)

### 2.1. Preparar o Frontend

Antes de fazer deploy, precisamos configurar o frontend para usar a API em produção.

#### 2.1.1. Criar arquivo de configuração de API

Crie o arquivo `web/src/config/api.ts`:

```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

#### 2.1.2. Usar a configuração nos componentes

Exemplo de uso:

```typescript
import { API_URL } from '@/config/api';

async function fetchProdutos() {
  const response = await fetch(`${API_URL}/produtos`);
  return response.json();
}
```

### 2.2. Deploy na Vercel

#### Opção A: Deploy via Dashboard (Recomendado)

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "Add New..." > "Project"
4. Importe seu repositório GitHub
5. Configure:

**Framework Preset**: Next.js (auto-detectado)

**Root Directory**: `web`

**Build and Output Settings**:
- Build Command: `npm run build` (auto-detectado)
- Output Directory: `.next` (auto-detectado)
- Install Command: `npm install` (auto-detectado)

**Environment Variables**:
```env
NEXT_PUBLIC_API_URL=https://sua-api-railway.up.railway.app
```

6. Clique em "Deploy"

#### Opção B: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Ir para pasta web
cd web

# Deploy
vercel

# Seguir prompts e configurar:
# - Link to existing project? No
# - Project name: sistema-restaurante-web
# - Directory: ./ (já está em web)
# - Want to override settings? Yes
# - Build Command: npm run build
# - Output Directory: .next
# - Development Command: npm run dev

# Adicionar variável de ambiente
vercel env add NEXT_PUBLIC_API_URL production
# Cole a URL do Railway

# Deploy em produção
vercel --prod
```

### 2.3. Configurar domínio (Opcional)

1. No dashboard da Vercel, vá em "Settings" > "Domains"
2. Adicione seu domínio customizado
3. Configure DNS conforme instruções

---

## Parte 3: Conectar Frontend e Backend

### 3.1. Configurar CORS no Backend

Certifique-se que o CORS está configurado para aceitar requisições da Vercel.

Edite `src/server.ts`:

```typescript
import cors from '@fastify/cors';

// Registrar CORS
await app.register(cors, {
  origin: [
    'http://localhost:3001',
    'https://sistema-restaurante-web.vercel.app', // Seu domínio Vercel
    'https://seu-dominio-customizado.com' // Se tiver
  ],
  credentials: true
});
```

Depois faça commit e push para atualizar o Railway:

```bash
git add .
git commit -m "Configure CORS for production"
git push
```

### 3.2. Testar a conexão

1. Acesse seu frontend na Vercel
2. Abra o Developer Tools (F12) > Network
3. Faça uma requisição que chama a API
4. Verifique se está chamando a URL correta do Railway

---

## Parte 4: Alternativas ao Railway

### Opção 1: Render.com

**Vantagens**: Plano gratuito, fácil de usar
**Desvantagens**: Instâncias gratuitas "dormem" após 15min de inatividade

1. Acesse [render.com](https://render.com)
2. Crie "New Web Service"
3. Conecte ao GitHub
4. Configure:
   - **Root Directory**: `/`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Crie PostgreSQL Database separadamente
6. Configure variáveis de ambiente

### Opção 2: Fly.io

**Vantagens**: Boa performance, deploys rápidos
**Desvantagens**: Requer CLI, configuração mais técnica

```bash
# Instalar CLI
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Criar app
flyctl launch

# Criar PostgreSQL
flyctl postgres create

# Anexar ao app
flyctl postgres attach nome-do-postgres

# Deploy
flyctl deploy
```

### Opção 3: AWS/Azure/Google Cloud

Para produção em larga escala, considere:
- **AWS**: EC2 + RDS PostgreSQL
- **Azure**: App Service + Azure Database for PostgreSQL
- **Google Cloud**: Cloud Run + Cloud SQL

---

## Checklist Final

### Backend (Railway)
- [ ] PostgreSQL criado e conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations executadas
- [ ] Dados de seed carregados (opcional)
- [ ] URL pública gerada
- [ ] CORS configurado para domínio da Vercel
- [ ] Health check funcionando: `https://sua-api.railway.app/health`

### Frontend (Vercel)
- [ ] Root directory configurado como `web`
- [ ] Variável `NEXT_PUBLIC_API_URL` configurada
- [ ] Deploy realizado com sucesso
- [ ] Página carrega corretamente
- [ ] Requisições à API funcionando

### Integração
- [ ] Frontend consegue chamar API
- [ ] CORS não está bloqueando
- [ ] Dados sendo carregados corretamente

---

## Monitoramento e Logs

### Railway
```bash
# Ver logs em tempo real
railway logs

# Ver logs de um serviço específico
railway logs --service backend
```

### Vercel
```bash
# Ver logs
vercel logs sistema-restaurante-web

# Logs em tempo real
vercel logs sistema-restaurante-web --follow
```

---

## Troubleshooting

### Erro: "Failed to fetch" no frontend

**Causa**: CORS ou URL incorreta

**Solução**:
1. Verifique `NEXT_PUBLIC_API_URL` na Vercel
2. Confira CORS no backend
3. Veja logs do Railway: `railway logs`

### Erro: "Internal Server Error" na API

**Causa**: Banco de dados não conectado ou migrations não rodaram

**Solução**:
```bash
railway run npm run db:migrate
railway logs
```

### Backend "dormente" no Render

**Causa**: Plano gratuito do Render dorme após inatividade

**Solução**:
1. Use Railway (não tem esse problema)
2. Ou configure um ping a cada 10 minutos
3. Ou faça upgrade para plano pago

### Erro 404 em rotas do Next.js

**Causa**: Root directory incorreto

**Solução**:
Certifique-se que "Root Directory" está como `web` na Vercel

---

## Custos Estimados

### Plano Gratuito (Desenvolvimento/MVP)
- **Railway**: $5/mês de crédito grátis (PostgreSQL + Backend)
- **Vercel**: Ilimitado para projetos pessoais
- **Total**: ~$0-5/mês

### Plano Produção (Pequeno)
- **Railway**: ~$20-30/mês (PostgreSQL + Backend com recursos dedicados)
- **Vercel**: $20/mês (Pro plan)
- **Total**: ~$40-50/mês

---

## Próximos Passos

1. Configure monitoramento com [Sentry](https://sentry.io) ou [LogRocket](https://logrocket.com)
2. Configure backups automáticos do banco (Railway tem isso nativo)
3. Adicione CI/CD com GitHub Actions
4. Configure alertas de erro
5. Adicione testes automatizados antes do deploy

---

## Comandos Úteis

```bash
# Ver status do Railway
railway status

# Abrir dashboard do Railway
railway open

# Conectar ao banco de dados
railway run psql

# Ver variáveis de ambiente
railway variables

# Redeploy na Vercel
vercel --prod

# Ver builds da Vercel
vercel ls
```

---

## Suporte

- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Render: [render.com/docs](https://render.com/docs)
