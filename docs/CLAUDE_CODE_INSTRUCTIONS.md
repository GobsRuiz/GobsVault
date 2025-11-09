# 🤖 Claude Code - Instruções de Desenvolvimento

## 📋 Sobre este Documento

Este documento contém instruções específicas para o **Claude Code** (extensão do VS Code) auxiliar no desenvolvimento do **GobsVault**. Leia atentamente antes de começar a codificar.

---

## 🎯 Contexto do Projeto

### O Que É o GobsVault?
**GobsVault** é uma plataforma web de trading simulado de criptomoedas com gamificação. Usuários começam com $10.000 virtuais e competem para aumentar seu capital através de trades estratégicos, ganhando XP, badges e subindo no ranking global.

### Objetivo do Projeto
Este é um **projeto de portfólio pessoal** para demonstrar habilidades técnicas avançadas em:
- Clean Architecture
- WebSocket real-time
- Segurança OWASP
- Performance e otimização
- Testes automatizados
- Código limpo e documentado

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework:** Nuxt 4 (Vue 3)
- **Modo:** SPA (Single Page Application)
- **UI:** Nuxt UI + Tailwind CSS
- **Gráficos:** nuxt-charts (Chart.js)
- **State:** Pinia
- **Validação:** Zod (shared)
- **Real-time:** Socket.IO Client

### Backend
- **Framework:** Fastify (Node.js)
- **Arquitetura:** Clean Architecture (4 camadas)
- **Database:** MongoDB + Mongoose
- **Cache:** Redis
- **Real-time:** Socket.IO Server
- **Validação:** Zod (shared)
- **Auth:** JWT (HttpOnly Cookies)
- **Segurança:** Helmet, CORS, Rate Limiting

### Shared
- **Schemas:** Zod (compartilhado entre frontend e backend)
- **Types:** TypeScript types compartilhados

---

## 📁 Estrutura de Diretórios

```
gobsvault/
├── frontend/          # Nuxt 4 (SPA)
├── backend/           # Fastify (Clean Architecture)
├── shared/            # Zod schemas + types
└── pnpm-workspace.yaml
```

### Backend - Clean Architecture (4 Camadas)

```
backend/src/
├── api/               # 1. Presentation Layer
│   ├── controllers/   # Thin layer - apenas delega
│   ├── routes/        # Definição de rotas
│   └── middlewares/   # Auth, validation, rate limit
│
├── application/       # 2. Application Layer
│   └── services/      # Business logic aqui!
│
├── domain/            # 3. Domain Layer
│   ├── models/        # Mongoose schemas
│   ├── interfaces/    # Contracts
│   └── types/         # Domain types
│
├── infrastructure/    # 4. Infrastructure Layer
│   ├── repositories/  # Database access
│   ├── cache/         # Redis
│   ├── external/      # External APIs
│   └── websocket/     # Socket.IO
│
├── shared/            # Cross-cutting
│   ├── errors/        # Custom errors
│   ├── utils/         # Utilities
│   └── config/        # Configuration
│
└── server.ts          # Entry point
```

---

## 🎨 Princípios de Código

### 1. Clean Code - SEMPRE
```typescript
// ❌ RUIM
const d = new Date()
function calc(a, b) { return a + b * 1.1 }

// ✅ BOM
const currentDate = new Date()
function calculateTotalWithTax(price: number, quantity: number): number {
  const TAX_RATE = 0.1
  return (price * quantity) * (1 + TAX_RATE)
}
```

### 2. TypeScript - NUNCA usar `any`
```typescript
// ❌ RUIM
function process(data: any) {}

// ✅ BOM
interface TradeData {
  symbol: string
  amount: number
  type: 'BUY' | 'SELL'
}
function process(data: TradeData): void {}
```

### 3. Single Responsibility
```typescript
// ❌ RUIM - Faz muita coisa
class UserController {
  async register(data) {
    // valida, hash, salva, envia email, atualiza cache, loga...
  }
}

// ✅ BOM - Cada classe uma responsabilidade
class UserController {
  constructor(private userService: UserService) {}
  
  async register(req, reply) {
    const user = await this.userService.create(req.body)
    return reply.code(201).send(user)
  }
}

class UserService {
  async create(data: CreateUserDto) {
    // business logic aqui
  }
}
```

### 4. Dependency Injection
```typescript
// ✅ BOM - Injeção de dependências
class TradeService {
  constructor(
    private tradeRepository: ITradeRepository,
    private priceService: IPriceService,
    private cacheService: ICacheService
  ) {}
  
  async executeTrade(data: TradeDto) {
    // Usa as dependências injetadas
  }
}
```

---

## 🔒 Segurança - Regras CRÍTICAS

### NUNCA Fazer:
❌ Commitar secrets (API keys, passwords, tokens)  
❌ Usar `eval()` ou executar código dinâmico  
❌ Confiar em dados do cliente sem validação  
❌ Expor stack traces em produção  
❌ Logar senhas, tokens ou dados sensíveis  
❌ Usar `SELECT *` ou buscar todos campos  
❌ Ignorar rate limiting  
❌ Esquecer CORS restritivo  

### SEMPRE Fazer:
✅ Validar TODOS inputs (Zod)  
✅ Bcrypt para senhas (12 rounds)  
✅ JWT com expiração curta (15min)  
✅ HttpOnly cookies para tokens  
✅ Rate limiting por endpoint  
✅ Helmet.js para headers de segurança  
✅ Audit log para ações críticas  
✅ Sanitizar inputs (mongo-sanitize)  

---

## 📊 Dados Específicos do Projeto

### Criptomoedas Disponíveis (Fase 1)
```typescript
const AVAILABLE_CRYPTOS = ['BTC', 'ETH', 'USDT']
```

### Sistema de XP e Ranks

```typescript
// XP Base
const BASE_XP = 10

// Ranks
const RANKS = {
  INICIANTE: { minLevel: 1, maxLevel: 5, minXP: 0, maxXP: 500 },
  BRONZE: { minLevel: 6, maxLevel: 10, minXP: 500, maxXP: 1500 },
  PRATA: { minLevel: 11, maxLevel: 20, minXP: 1500, maxXP: 5000 },
  OURO: { minLevel: 21, maxLevel: 35, minXP: 5000, maxXP: 15000 },
  DIAMANTE: { minLevel: 36, maxLevel: Infinity, minXP: 15000, maxXP: Infinity }
}
```

### Trade Bem-Sucedido (para Combo)
```typescript
// Trade de VENDA que resulta em LUCRO
// Exemplo: Comprou BTC a $40k, vendeu a $45k = ✅ bem-sucedido
// Exemplo: Comprou BTC a $40k, vendeu a $38k = ❌ mal-sucedido (quebra combo)
// Trades de COMPRA não afetam o combo
```

### Rate Limiting por Endpoint

```typescript
const RATE_LIMITS = {
  global: { max: 100, window: '1 minute' },
  login: { max: 5, window: '15 minutes' },
  register: { max: 3, window: '1 hour' },
  trades: { max: 10, window: '1 minute' },
  leaderboard: { max: 20, window: '1 minute' },
  prices: { max: 30, window: '1 minute' },
  friends: { max: 10, window: '5 minutes' },
  profile: { max: 5, window: '5 minutes' },
  quests: { max: 20, window: '1 minute' }
}
```

---

## 🧪 Testes - Obrigatório

### Estrutura de Testes
```
backend/src/tests/
├── unit/           # Testes unitários (services)
├── integration/    # Testes de API (routes)
└── e2e/           # Testes end-to-end
```

### Coverage Mínimo
- Services: **80%**
- Routes: **70%**
- Repositories: **70%**

### Exemplo de Teste
```typescript
// ✅ BOM - Teste unitário com mocks
describe('TradeService', () => {
  it('should execute buy trade successfully', async () => {
    // Arrange
    const mockRepo = { create: jest.fn().mockResolvedValue(trade) }
    const service = new TradeService(mockRepo)
    
    // Act
    const result = await service.executeTrade(userId, tradeData)
    
    // Assert
    expect(result).toMatchObject({ symbol: 'BTC' })
    expect(mockRepo.create).toHaveBeenCalled()
  })
})
```

---

## 🚀 Comandos Úteis

### Desenvolvimento
```bash
# Instalar dependências
pnpm install

# Dev - Frontend
cd frontend && pnpm dev

# Dev - Backend
cd backend && pnpm dev

# Testes
pnpm test

# Lint
pnpm lint

# Build
pnpm build
```

---

## 📝 Padrões de Commit

Use **Conventional Commits**:
```bash
feat: add XP calculation for trades
fix: prevent negative balance in trades
refactor: extract trade logic to service
docs: update API documentation
test: add unit tests for TradeService
chore: update dependencies
```

---

## 🎯 Fluxo de Trabalho

### Ao Criar uma Nova Feature:

1. **Leia a documentação relevante**
   - PROJECT_DOCUMENTATION.md
   - DEVELOPMENT_GUIDELINES.md
   - Este arquivo

2. **Planeje a arquitetura**
   - Qual camada será afetada?
   - Precisa de novo model/interface?
   - Precisa de testes?

3. **Siga Clean Architecture**
   - Controller → delega para Service
   - Service → business logic
   - Repository → database access

4. **Valide TUDO com Zod**
   - Schemas em `/shared/schemas`
   - Use em frontend E backend

5. **Escreva testes**
   - Unit tests para services
   - Integration tests para routes

6. **Documente**
   - JSDoc/TSDoc em funções complexas
   - README se necessário

---

## ⚠️ Avisos Importantes

### Backend
- **SEMPRE** use interfaces para dependências
- **SEMPRE** injete dependências nos construtores
- **NUNCA** acesse banco direto no controller
- **SEMPRE** use try-catch ou deixe propagar para error handler
- **SEMPRE** valide com Zod antes de processar

### Frontend
- **SEMPRE** use composables para lógica reutilizável
- **SEMPRE** use Pinia para estado global
- **NUNCA** faça requests HTTP direto nos components (use composables)
- **SEMPRE** use Nuxt UI components quando possível
- **SEMPRE** valide com Zod antes de enviar ao backend

### Geral
- **NUNCA** commite `.env` (use `.env.example`)
- **SEMPRE** use TypeScript strict mode
- **SEMPRE** rode linter antes de commit
- **NUNCA** deixe `console.log` em produção (use logger)
- **SEMPRE** trate erros apropriadamente

---

## 🔥 Exemplos de Código Completo

### Exemplo 1: Criar Nova Feature de Trade

#### 1. Schema Zod (shared)
```typescript
// shared/schemas/trade.schema.ts
import { z } from 'zod'

export const createTradeSchema = z.object({
  symbol: z.enum(['BTC', 'ETH', 'USDT']),
  amount: z.number().positive().max(1000000),
  type: z.enum(['BUY', 'SELL'])
})

export type CreateTradeDto = z.infer<typeof createTradeSchema>
```

#### 2. Interface (domain)
```typescript
// backend/src/domain/interfaces/ITradeRepository.ts
export interface ITradeRepository {
  create(data: CreateTradeDto): Promise<Trade>
  findByUserId(userId: string): Promise<Trade[]>
}
```

#### 3. Repository (infrastructure)
```typescript
// backend/src/infrastructure/repositories/trade.repository.ts
export class TradeRepository implements ITradeRepository {
  async create(data: CreateTradeDto): Promise<Trade> {
    return TradeModel.create(data)
  }
  
  async findByUserId(userId: string): Promise<Trade[]> {
    return TradeModel.find({ userId }).sort({ createdAt: -1 })
  }
}
```

#### 4. Service (application)
```typescript
// backend/src/application/services/trade.service.ts
export class TradeService {
  constructor(
    private tradeRepository: ITradeRepository,
    private priceService: PriceService
  ) {}
  
  async executeTrade(userId: string, data: CreateTradeDto): Promise<Trade> {
    // Business logic
    const price = await this.priceService.getCurrentPrice(data.symbol)
    
    const trade = await this.tradeRepository.create({
      ...data,
      userId,
      price,
      total: price * data.amount
    })
    
    return trade
  }
}
```

#### 5. Controller (presentation)
```typescript
// backend/src/api/controllers/trade.controller.ts
export class TradeController {
  constructor(private tradeService: TradeService) {}
  
  async create(req: FastifyRequest, reply: FastifyReply) {
    const trade = await this.tradeService.executeTrade(
      req.user.id,
      req.body
    )
    
    return reply.code(201).send({ success: true, data: trade })
  }
}
```

#### 6. Route (presentation)
```typescript
// backend/src/api/routes/trade.routes.ts
export async function tradeRoutes(app: FastifyInstance) {
  app.post('/api/trades', {
    preHandler: [authMiddleware, validateSchema(createTradeSchema)]
  }, tradeController.create)
}
```

#### 7. Composable Frontend (Nuxt)
```typescript
// frontend/composables/useTrade.ts
export const useTrade = () => {
  const executeTrade = async (data: CreateTradeDto) => {
    // Valida no cliente
    const validated = createTradeSchema.parse(data)
    
    // Faz request
    const response = await $fetch('/api/trades', {
      method: 'POST',
      body: validated
    })
    
    return response
  }
  
  return { executeTrade }
}
```

#### 8. Uso no Component (Nuxt)
```vue
<!-- frontend/components/trading/TradeModal.vue -->
<script setup lang="ts">
const { executeTrade } = useTrade()

const form = reactive({
  symbol: 'BTC',
  amount: 0,
  type: 'BUY'
})

async function handleSubmit() {
  try {
    await executeTrade(form)
    // Sucesso
  } catch (error) {
    // Erro
  }
}
</script>
```

---

## 📚 Documentação de Referência

### Leia Antes de Codificar:
1. **PROJECT_DOCUMENTATION.md** - Visão completa do projeto
2. **DEVELOPMENT_GUIDELINES.md** - Boas práticas detalhadas
3. Este arquivo - Instruções específicas para Claude Code

### Links Úteis:
- [Nuxt 4 Docs](https://nuxt.com/)
- [Fastify Docs](https://fastify.dev/)
- [Zod Docs](https://zod.dev/)
- [Pinia Docs](https://pinia.vuejs.org/)
- [Socket.IO Docs](https://socket.io/docs/)

---

## 🎯 Checklist Antes de Cada Commit

```
✅ Código segue Clean Architecture
✅ TypeScript sem erros (pnpm tsc)
✅ Linter sem warnings (pnpm lint)
✅ Testes passando (pnpm test)
✅ Validação Zod em ambos lados
✅ Sem console.log
✅ Sem dados sensíveis
✅ Commit message conventional
✅ Código documentado (se complexo)
```

---

## 💡 Dicas Finais

### Performance
- Use Redis cache para dados frequentes
- Implemente pagination em listas grandes
- Use lean() em queries Mongoose
- Debounce em inputs de busca (frontend)

### Segurança
- Sempre valide no backend (nunca confie no cliente)
- Rate limit em TODOS endpoints
- Audit log em ações críticas
- Nunca exponha stack traces

### Manutenibilidade
- Prefira código simples a código "inteligente"
- Documente decisões complexas
- Extraia magic numbers para constantes
- Escreva testes para business logic crítica

---

**Lembre-se:** Este é um projeto de portfólio. A qualidade do código é TÃO importante quanto as funcionalidades. Impressione pela arquitetura, segurança e boas práticas!

**Última atualização:** Novembro 2025  
**Versão:** 1.0.0
