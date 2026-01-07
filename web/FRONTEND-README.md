# Frontend - Buffet Manager

Interface web moderna para o sistema de gestão de buffet itinerante.

## Design

Interface inspirada no HubSpot com estética clean e profissional:
- Paleta de cores: Laranja primário (#ff4800) + tons neutros
- Layout responsivo com sidebar fixa
- Componentes minimalistas com sombras sutis
- Tipografia moderna e hierárquica

## Tecnologias

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Turbopack** (bundler)

## Rodar o Frontend

```bash
cd web
npm run dev
```

Acesse: **http://localhost:3001**

## Páginas Implementadas

### Dashboard (/)
- Cards de estatísticas (eventos, produtos, equipamentos, clientes)
- Ações rápidas
- Alertas de estoque
- Próximos eventos

### Produtos (/produtos)
- Listagem completa de produtos
- Indicadores de estoque (crítico, baixo, normal)
- Adicionar novos produtos
- Visualização de unidades e quantidades

### Eventos (/eventos)
- Grade de cards com todos os eventos
- Status visual (rascunho, planejado, em andamento, fechado)
- Detalhes de cliente, data, participantes
- Acesso rápido ao planejamento

### Detalhes do Evento (/eventos/[id])
- Informações completas do evento
- **Planejamento**: Gera checklists automáticos
  - Checklist de compras (itens faltantes)
  - Checklist do que levar (produtos + equipamentos)
  - Alertas de estoque insuficiente
- **Fechamento**: Registra conclusão do evento
- Visualização do cardápio completo

## Fluxo de Uso

1. **Criar Produtos** - Cadastrar ingredientes e consumíveis
2. **Criar Equipamentos** - Cadastrar utensílios e equipamentos
3. **Criar Cardápios** - Montar menus com produtos e assets
4. **Criar Eventos** - Vincular cliente, cardápio e participantes
5. **Planejar** - Sistema gera checklists automaticamente
6. **Executar** - Levar itens conforme checklist
7. **Fechar** - Registrar sobras e perdas

## Integração com Backend

Todas as requisições são feitas para: http://localhost:3000

Endpoints utilizados:
- GET /eventos - Listar eventos
- GET /eventos/:id - Detalhes do evento
- POST /eventos/:id/planejar - Planejar evento
- POST /eventos/:id/fechar - Fechar evento
- GET /produtos - Listar produtos
- POST /produtos - Criar produto
