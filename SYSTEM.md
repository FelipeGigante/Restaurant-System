1) Visão do produto
Problema
Um buffer itinerante (que roda por cidades/eventos) sofre com:
Perda de controle de estoque (ingredientes, descartáveis, etc.)
Perda de controle de utensílios/equipamentos (facas, garfos, mini-forno, airfryer…)
Falhas na preparação do evento (esquecer itens, comprar errado, faltar ingrediente)
Pós-evento sem rastreabilidade (o que sobrou? o que foi consumido? o que sumiu?)
Solução (proposta)
Um sistema onde o usuário, no dia do evento, seleciona:
o evento
quantidade de participantes
o cardápio contratado
→ e o sistema devolve:
Checklist do que levar (utensílios/equipamentos + descartáveis)
Checklist de compras faltantes (itens insuficientes no estoque)
Baixa/Reserva no estoque baseada em estimativas do cardápio
Checklist de retorno para registrar sobras e retorno ao estoque

2) Conceitos do domínio (linguagem do produto)
Pense no domínio como “tabelas mentais”:
Produto: item consumível (tomate, queijo, carvão, guardanapo)
Equipamento: item reutilizável (mini-forno, airfryer, faca do chef)
Utensílio: reutilizável/contável (garfos, pratos, copos, pegadores)
Estoque:
de produtos = quantidade que diminui e pode voltar como “sobra”
de equipamentos/utensílios = quantidade contável, risco de perda
Cardápio: conjunto de regras de consumo (ingredientes por pessoa) + itens necessários (equipamentos/utensílios)
Evento: instância real (data, cidade, cliente, tipo/tema, participantes)
Tipo de evento: “tema”/categoria que influencia cardápios possíveis e regras
Movimentação: tudo que altera o estado do estoque (reserva, consumo, compra, retorno, perda)

3) Escopo do MVP (o que vira produto rápido e consistente)
MVP deve ter
Cadastro de Produtos + Estoque atual
Cadastro de Equipamentos/Utensílios + quantidades
Cadastro de Cardápios com:
consumo de produtos por pessoa
itens necessários (equipamentos e utensílios por evento e/ou por pessoa)
Cadastro de Eventos (com tipo/tema)
Planejamento do evento (core):
gerar checklist do que levar
gerar checklist de compras faltantes
reservar/dar baixa (modo configurável)
Fechamento do evento:
registrar sobras (retornar ao estoque)
registrar perdas/danos (equipamentos/utensílios)
relatório simples do evento (consumo estimado vs real)
Fora do MVP (deixar preparado mas não obrigatório)
Multi-empresa (multi-tenant)
Custos/precificação e margem
Integração com compras/fornecedor
App offline-first
Rotas/logística

4) Regras de negócio (o coração do sistema)
4.1 Planejamento (antes do evento)
Ao selecionar evento + participantes + cardápio, calcular:
A) Necessidades de Produtos (ingredientes/consumíveis)
necessario_produto = participantes * consumo_por_pessoa
Ex: tomate: 10 pessoas * 1 tomate = 10 tomates
B) Necessidades de Utensílios/Equipamentos
Itens “por evento” (ex: 1 airfryer)
Itens “por pessoa” (ex: 1 garfo por pessoa)
Itens “por lote” (ex: 1 faca a cada 20 pessoas) — opcional, mas bom já prever
C) Checklist de Compras faltantes
faltante = max(0, necessario - estoque_atual)
Se faltante > 0, entra no checklist de compras.
D) Ação no estoque (duas estratégias possíveis)
Você escolhe uma delas (recomendo a 1 pro MVP):
Reserva (recomendado): cria “estoque reservado” pro evento sem reduzir o estoque físico imediatamente.
Prós: evita bagunça se o evento for editado/cancelado.
No dia/fechamento você converte reserva em consumo real.
Baixa imediata: já reduz o estoque no planejamento.
Prós: simples.
Contras: cancelar/editar vira dor.
✅ Sugestão MVP: usar Reserva para produtos e “alocação” para equipamentos/utensílios.
4.2 Durante / pós-evento (fechamento)
No final do evento, registrar:
Sobras de produtos: voltam ao estoque (ou viram descarte)
Consumo real (se você quiser granular): ajustar diferença do estimado
Perdas de utensílios/equipamentos: decrementa quantidade disponível e marca ocorrência

5) Arquitetura em módulos (bem alinhado pra codar)
5.1 Módulos de domínio (camada core)
Inventory
Produtos e quantidades
Movimentações (ledger)
Reservas por evento
Assets
Equipamentos e utensílios
Alocação por evento
Perdas/danos
Menu
Cardápios
Receitas/insumos por pessoa
Itens necessários (assets) por pessoa/evento
Events
Evento, tipo/tema, participantes
Estado do evento: DRAFT -> PLANNED -> IN_PROGRESS -> CLOSED -> CANCELED
Planner (Orquestração)
Gera checklists
Calcula necessidades
Cria reservas/alocações
Reports (simples no MVP)
resumo por evento: faltantes, consumos, perdas, sobras
5.2 Camadas do sistema
API (REST)
Service layer (regras de negócio)
Domain + Repositories
DB (Postgres)
UI (web simples)

7) APIs (REST) — endpoints mínimos
Produtos/Estoque
POST /products
GET /products
PATCH /stock/products/:productId (ajuste manual)
GET /stock/products
Assets (equipamentos/utensílios)
POST /assets
GET /assets
PATCH /stock/assets/:assetId
Cardápios
POST /menus
GET /menus
POST /menus/:menuId/requirements/products
POST /menus/:menuId/requirements/assets
Eventos
POST /events
GET /events
PATCH /events/:eventId (participants, menu, etc)
Planejamento (core)
POST /events/:eventId/plan
body: { participants, menu_id }
response:
carry_checklist (assets + quantities)
shopping_checklist (products faltantes)
reserved_summary
warnings (ex: “estoque insuficiente para X”)
Fechamento
POST /events/:eventId/close
body: returns: [...], losses: [...]
effect: atualiza estoque e finaliza estado
8) Fluxos ponta-a-ponta (o que o usuário faz)
Fluxo A — Cadastro base
Cadastrar produtos e quantidades
Cadastrar equipamentos/utensílios e quantidades
Cadastrar tipos de evento
Cadastrar cardápios vinculados (ou não) a tipos de evento
Fluxo B — Planejar evento (Dia do evento)
Usuário abre evento
Define participantes e menu contratado
Sistema roda Planner:
calcula necessidades
cria reservas/alocações
mostra checklists (levar e comprar)
Fluxo C — Fechar evento
Usuário informa sobras retornadas
Informa perdas/danos
Sistema:
converte reserva em consumo efetivo (ou ajusta)
retorna sobras ao estoque
atualiza assets disponíveis
fecha evento e gera resumo

9) Critérios de aceitação (testáveis)
Planejamento
Dado um evento com participants=10 e menu X com tomate=1/un por pessoa,
quando planejar,
então o sistema calcula tomate=10.
Se estoque atual de tomate = 5,
então checklist de compras inclui tomate faltante=5.
Checklist do que levar inclui:
itens PER_PERSON multiplicados por participantes
itens PER_EVENT com quantidade fixa
Planejar evento muda status para PLANNED e cria reservas/alocações.
Fechamento
Ao fechar com tomate_return=2,
estoque final reflete retorno.
Ao registrar garfos lost=3,
asset_stock.qty_available diminui conforme a regra definida.
Evento finaliza em CLOSED e não permite replanejar sem reabrir (ou exige ação explícita).

10) Requisitos não funcionais
Auditabilidade: toda alteração de estoque gera inventory_movements.
Idempotência: POST /events/:id/plan deve ser idempotente (replanejar substitui reservas anteriores).
Consistência: transações DB para planejar/fechar.
Permissões (mínimo): admin vs operador (opcional no MVP).
Observabilidade: logs de ações por evento.

12) Sugestão de stack (pra virar produto com velocidade)
Vou manter objetivo e simples:
Backend: Node.js + TypeScript (Fastify ou Nest) ou Python FastAPI (se você preferir)
DB: Postgres
ORM: Prisma (TS) ou SQLModel/SQLAlchemy (Py)
Frontend: Next.js (páginas simples: estoque, assets, menus, eventos, planejar, fechar)
Auth: opcional no MVP (pode usar um “single user mode”)

VAMOS COMERCAR COM O MINIMO VIAVEL PARA RODAR. NAO GERE DIVERSOS ARQUIVOS .MD, QUICKSTART, README. COMECE APENAS GERANDO UM ARQUIVO DE COMO RODAR O PROJETO INICIALMENTE.