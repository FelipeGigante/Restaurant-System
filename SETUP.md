# Setup - Sistema de Gestão para Buffet

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## 1. Configurar o banco de dados

Crie um banco PostgreSQL:

```bash
# Via psql
createdb restaurante

# Ou via SQL
CREATE DATABASE restaurante;
```

## 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure a URL do banco:

```
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/restaurante?schema=public"
PORT=3000
```

## 3. Instalar dependências

```bash
npm install
```

## 4. Executar migrations

```bash
npm run db:migrate
```

Isso criará todas as tabelas no banco de dados.

## 5. (Opcional) Popular com dados de exemplo

```bash
npm run db:seed
```

Isso criará:
- Produtos de exemplo (tomate, queijo, guardanapo, etc)
- Assets de exemplo (airfryer, facas, garfos, etc)
- Cliente de exemplo
- Menu de exemplo (Churrasco)
- Tipo de evento (Casamento)

## 6. Rodar o servidor

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## 7. Testar

Acesse: `http://localhost:3000/health`

Você deve ver: `{"status":"ok","timestamp":"..."}`

## Endpoints principais

### Produtos
- `GET /produtos` - Listar produtos
- `POST /produtos` - Criar produto
- `PATCH /produtos/:id/estoque` - Ajustar estoque

### Assets
- `GET /assets` - Listar equipamentos/utensílios
- `POST /assets` - Criar asset

### Clientes
- `GET /clientes` - Listar clientes
- `POST /clientes` - Criar cliente

### Menus
- `GET /menus` - Listar menus
- `POST /menus` - Criar menu
- `POST /menus/:menuId/produtos` - Adicionar produto ao menu
- `POST /menus/:menuId/assets` - Adicionar asset ao menu

### Eventos
- `GET /eventos` - Listar eventos
- `POST /eventos` - Criar evento
- `PATCH /eventos/:id` - Atualizar evento (definir menu, participantes)

### Planejamento (CORE)
- `POST /eventos/:eventoId/planejar` - Planejar evento (gera checklists e reservas)
- `POST /eventos/:eventoId/fechar` - Fechar evento (registrar sobras e perdas)

## Fluxo básico de uso

1. Cadastrar produtos, assets e clientes
2. Criar um menu e adicionar produtos/assets a ele
3. Criar um evento para um cliente
4. Definir menu e participantes no evento (`PATCH /eventos/:id`)
5. Planejar evento (`POST /eventos/:eventoId/planejar`)
   - Receber checklists do que levar e comprar
6. Fechar evento (`POST /eventos/:eventoId/fechar`)
   - Informar sobras e perdas

## Ferramentas úteis

### Prisma Studio (visualizar dados)

```bash
npm run db:studio
```

Abre interface web em `http://localhost:5555`

### Build para produção

```bash
npm run build
npm start
```
