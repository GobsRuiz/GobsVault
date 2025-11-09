# 📖 GobsVault - Guia de Desenvolvimento e Boas Práticas

## 📋 Índice

1. [Princípios Fundamentais](#princípios-fundamentais)
2. [Arquitetura e Estrutura](#arquitetura-e-estrutura)
3. [Padrões de Código](#padrões-de-código)
4. [TypeScript - Boas Práticas](#typescript---boas-práticas)
5. [Backend - Node.js + Fastify](#backend---nodejs--fastify)
6. [Frontend - Nuxt 4 + Vue 3](#frontend---nuxt-4--vue-3)
7. [Banco de Dados - MongoDB](#banco-de-dados---mongodb)
8. [Cache - Redis](#cache---redis)
9. [WebSocket - Socket.IO](#websocket---socketio)
10. [Segurança - OWASP](#segurança---owasp)
11. [Performance e Otimização](#performance-e-otimização)
12. [Testes](#testes)
13. [Error Handling](#error-handling)
14. [Logging](#logging)
15. [Git Workflow](#git-workflow)
16. [Code Review](#code-review)
17. [Documentação](#documentação)
18. [O Que NÃO Fazer](#o-que-não-fazer)

---

## 🎯 Princípios Fundamentais

### SOLID Principles

#### 1. Single Responsibility Principle (SRP)
**Cada classe/função deve ter apenas UMA responsabilidade.**

```typescript
// ❌ RUIM - Faz muita coisa
class UserController {
  async register(data) {
    // Valida dados
    // Hash de senha
    // Salva no banco
    // Envia email
    // Atualiza cache
    // Loga evento
  }
}

// ✅ BOM - Responsabilidades separadas
class UserController {
  constructor(
    private userService: UserService,
    private emailService: EmailService
  ) {}
  
  async register(data) {
    const user = await this.userService.create(data)
    await this.emailService.sendWelcome(user.email)
    return user
  }
}

class UserService {
  constructor(
    private userRepository: UserRepository,
    private cacheService: CacheService
  ) {}
  
  async create(data) {
    const validated = userSchema.parse(data)
    const hashedPassword = await hashPassword(validated.password)
    const user = await this.userRepository.save({ ...validated, password: hashedPassword })
    await this.cacheService.invalidate('users')
    return user
  }
}
```

#### 2. Open/Closed Principle (OCP)
**Aberto para extensão, fechado para modificação.**

```typescript
// ✅ BOM - Extensível sem modificar código existente
interface NotificationChannel {
  send(message: string): Promise<void>
}

class EmailNotification implements NotificationChannel {
  async send(message: string) {
    // Envia email
  }
}

class PushNotification implements NotificationChannel {
  async send(message: string) {
    // Envia push
  }
}

class NotificationService {
  constructor(private channels: NotificationChannel[]) {}
  
  async notify(message: string) {
    await Promise.all(
      this.channels.map(channel => channel.send(message))
    )
  }
}

// Adicionar novo canal = criar nova classe, sem modificar existentes
```

#### 3. Liskov Substitution Principle (LSP)
**Subtipos devem ser substituíveis por seus tipos base.**

```typescript
// ✅ BOM
interface CryptoPrice {
  getCurrentPrice(symbol: string): Promise<number>
}

class CoinGeckoProvider implements CryptoPrice {
  async getCurrentPrice(symbol: string): Promise<number> {
    // Implementação CoinGecko
    return 45000
  }
}

class BinanceProvider implements CryptoPrice {
  async getCurrentPrice(symbol: string): Promise<number> {
    // Implementação Binance
    return 45010
  }
}

// Service aceita qualquer implementação de CryptoPrice
class TradeService {
  constructor(private priceProvider: CryptoPrice) {}
  
  async executeTrade(symbol: string) {
    const price = await this.priceProvider.getCurrentPrice(symbol)
    // ...
  }
}
```

#### 4. Interface Segregation Principle (ISP)
**Clientes não devem depender de interfaces que não usam.**

```typescript
// ❌ RUIM - Interface muito grande
interface User {
  login(): void
  logout(): void
  trade(): void
  updateProfile(): void
  deleteAccount(): void
  generateReport(): void
}

// ✅ BOM - Interfaces segregadas
interface Authenticable {
  login(): void
  logout(): void
}

interface Trader {
  trade(): void
}

interface ProfileManager {
  updateProfile(): void
  deleteAccount(): void
}

class RegularUser implements Authenticable, Trader, ProfileManager {
  // Implementa apenas o necessário
}
```

#### 5. Dependency Inversion Principle (DIP)
**Dependa de abstrações, não de implementações concretas.**

```typescript
// ❌ RUIM - Dependência direta
class UserService {
  private mongoRepository = new MongoUserRepository()
  
  async getUser(id: string) {
    return this.mongoRepository.findById(id)
  }
}

// ✅ BOM - Depende de abstração (interface)
interface UserRepository {
  findById(id: string): Promise<User>
  save(user: User): Promise<User>
}

class UserService {
  constructor(private repository: UserRepository) {}
  
  async getUser(id: string) {
    return this.repository.findById(id)
  }
}

// Pode injetar MongoRepository, PostgresRepository, MockRepository, etc
```

### DRY (Don't Repeat Yourself)
**Não repita código - extraia para funções/módulos reutilizáveis.**

```typescript
// ❌ RUIM - Código duplicado
app.get('/api/users/:id', async (req, reply) => {
  const token = req.cookies.accessToken
  if (!token) return reply.code(401).send({ error: 'Unauthorized' })
  const user = verifyToken(token)
  if (!user) return reply.code(401).send({ error: 'Invalid token' })
  // ...
})

app.get('/api/trades', async (req, reply) => {
  const token = req.cookies.accessToken
  if (!token) return reply.code(401).send({ error: 'Unauthorized' })
  const user = verifyToken(token)
  if (!user) return reply.code(401).send({ error: 'Invalid token' })
  // ...
})

// ✅ BOM - Middleware reutilizável
async function authMiddleware(req, reply) {
  const token = req.cookies.accessToken
  if (!token) throw new UnauthorizedError('No token provided')
  
  const user = verifyToken(token)
  if (!user) throw new UnauthorizedError('Invalid token')
  
  req.user = user
}

app.get('/api/users/:id', { preHandler: authMiddleware }, async (req, reply) => {
  // req.user já disponível
})

app.get('/api/trades', { preHandler: authMiddleware }, async (req, reply) => {
  // req.user já disponível
})
```

### KISS (Keep It Simple, Stupid)
**Prefira soluções simples. Não complique desnecessariamente.**

```typescript
// ❌ RUIM - Overengineering
class ComplexCalculatorFactoryBuilderSingleton {
  private static instance: ComplexCalculatorFactoryBuilderSingleton
  
  private constructor() {}
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new ComplexCalculatorFactoryBuilderSingleton()
    }
    return this.instance
  }
  
  createCalculator() {
    return new Calculator()
  }
}

// ✅ BOM - Simples e direto
function calculateXP(baseXP: number, level: number, combo: number): number {
  const levelMultiplier = 1 + (level * 0.1)
  const comboBonus = combo * 5
  return (baseXP * levelMultiplier) + comboBonus
}
```

### YAGNI (You Aren't Gonna Need It)
**Não implemente features que você não precisa AGORA.**

```typescript
// ❌ RUIM - Implementando feature que não vai usar
class User {
  // ...
  async exportToXML() { /* ... */ }
  async exportToCSV() { /* ... */ }
  async exportToJSON() { /* ... */ }
  async exportToPDF() { /* ... */ }
  // 90% desses métodos nunca serão usados
}

// ✅ BOM - Implemente quando precisar
class User {
  // Apenas os campos necessários
  id: string
  username: string
  email: string
}

// Se um dia precisar de export, crie um ExportService
```

---

## 🏗️ Arquitetura e Estrutura

### Clean Architecture - 4 Camadas

O backend do GobsVault segue **Clean Architecture** com separação clara de responsabilidades em 4 camadas:

```
┌─────────────────────────────────────────────┐
│   1. PRESENTATION LAYER                     │
│   (Controllers, Routes, Middlewares)        │
│   - Recebe requests HTTP/WebSocket          │
│   - Valida inputs básicos                   │
│   - Delega para Application Layer           │
│   - Retorna responses                       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│   2. APPLICATION LAYER (Services)           │
│   - Business Logic (regras de negócio)      │
│   - Orquestra operações                     │
│   - Coordena Domain + Infrastructure        │
│   - Transactions                            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│   3. DOMAIN LAYER                           │
│   - Models (Mongoose schemas)               │
│   - Interfaces/Contracts                    │
│   - Domain Types                            │
│   - Business rules simples                  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│   4. INFRASTRUCTURE LAYER                   │
│   - Database (MongoDB)                      │
│   - Cache (Redis)                           │
│   - External APIs (CoinGecko)               │
│   - WebSocket                               │
└─────────────────────────────────────────────┘
```

### Estrutura de Diretórios Completa - Backend

```
backend/
└── src/
    ├── api/                                # 1. PRESENTATION LAYER
    │   ├── controllers/                    # Controllers (thin layer)
    │   │   ├── auth.controller.ts
    │   │   ├── user.controller.ts
    │   │   ├── trade.controller.ts
    │   │   ├── crypto.controller.ts
    │   │   ├── leaderboard.controller.ts
    │   │   ├── friend.controller.ts
    │   │   └── quest.controller.ts
    │   │
    │   ├── routes/                         # Routes configuration
    │   │   ├── index.ts                    # Route aggregator
    │   │   ├── auth.routes.ts
    │   │   ├── user.routes.ts
    │   │   ├── trade.routes.ts
    │   │   ├── crypto.routes.ts
    │   │   ├── leaderboard.routes.ts
    │   │   ├── friend.routes.ts
    │   │   └── quest.routes.ts
    │   │
    │   └── middlewares/                    # Middlewares
    │       ├── auth.middleware.ts          # Authentication
    │       ├── validation.middleware.ts    # Input validation (Zod)
    │       ├── rateLimit.middleware.ts     # Rate limiting
    │       └── error.middleware.ts         # Error handling
    │
    ├── application/                        # 2. APPLICATION LAYER
    │   └── services/                       # Business logic
    │       ├── auth.service.ts
    │       ├── user.service.ts
    │       ├── trade.service.ts
    │       ├── crypto.service.ts
    │       ├── gamification.service.ts     # XP, badges, quests
    │       ├── portfolio.service.ts
    │       ├── leaderboard.service.ts
    │       ├── friend.service.ts
    │       ├── quest.service.ts
    │       └── notification.service.ts
    │
    ├── domain/                             # 3. DOMAIN LAYER
    │   ├── models/                         # Mongoose models
    │   │   ├── User.model.ts
    │   │   ├── Trade.model.ts
    │   │   ├── Portfolio.model.ts
    │   │   ├── Quest.model.ts
    │   │   ├── Badge.model.ts
    │   │   ├── Friend.model.ts
    │   │   └── AuditLog.model.ts
    │   │
    │   ├── interfaces/                     # Contracts/Interfaces
    │   │   ├── IRepository.ts              # Base repository interface
    │   │   ├── ITradeRepository.ts
    │   │   ├── IUserRepository.ts
    │   │   ├── IPortfolioRepository.ts
    │   │   ├── IPriceProvider.ts           # External price provider
    │   │   └── ICacheService.ts
    │   │
    │   └── types/                          # Domain types
    │       ├── index.ts
    │       ├── trade.types.ts
    │       ├── user.types.ts
    │       └── gamification.types.ts
    │
    ├── infrastructure/                     # 4. INFRASTRUCTURE LAYER
    │   ├── repositories/                   # Data access (MongoDB)
    │   │   ├── base.repository.ts          # Base repository
    │   │   ├── user.repository.ts
    │   │   ├── trade.repository.ts
    │   │   ├── portfolio.repository.ts
    │   │   ├── quest.repository.ts
    │   │   ├── badge.repository.ts
    │   │   └── friend.repository.ts
    │   │
    │   ├── cache/                          # Cache layer (Redis)
    │   │   ├── redis.client.ts             # Redis connection
    │   │   └── cache.service.ts            # Cache operations
    │   │
    │   ├── external/                       # External APIs
    │   │   └── coingecko.service.ts        # CoinGecko API client
    │   │
    │   └── websocket/                      # WebSocket (Socket.IO)
    │       ├── socket.handler.ts           # Socket.IO setup
    │       └── events/
    │           ├── price.events.ts
    │           └── notification.events.ts
    │
    ├── shared/                             # Cross-cutting concerns
    │   ├── errors/                         # Custom errors
    │   │   ├── AppError.ts
    │   │   ├── ValidationError.ts
    │   │   ├── UnauthorizedError.ts
    │   │   └── NotFoundError.ts
    │   │
    │   ├── utils/                          # Utility functions
    │   │   ├── jwt.util.ts
    │   │   ├── bcrypt.util.ts
    │   │   ├── logger.util.ts
    │   │   └── validators.util.ts
    │   │
    │   └── config/                         # Configuration
    │       ├── app.config.ts
    │       ├── database.config.ts
    │       └── redis.config.ts
    │
    ├── tests/                              # Tests
    │   ├── unit/                           # Unit tests
    │   │   └── services/
    │   ├── integration/                    # Integration tests
    │   │   └── api/
    │   └── e2e/                           # End-to-end tests
    │
    └── server.ts                           # Application entry point
```

### Estrutura de Diretórios - Frontend (Nuxt 4)

```
frontend/
├── pages/                                  # Pages (auto-routing)
│   ├── index.vue                          # Home page
│   ├── dashboard.vue                      # Dashboard
│   ├── profile.vue                        # User profile
│   ├── leaderboard.vue                    # Leaderboard
│   └── auth/
│       ├── login.vue
│       └── register.vue
│
├── components/                             # Vue components
│   ├── common/                            # Reusable components
│   │   ├── Button.vue
│   │   ├── Card.vue
│   │   ├── Modal.vue
│   │   └── Input.vue
│   │
│   ├── trading/                           # Trading components
│   │   ├── CryptoList.vue
│   │   ├── TradeModal.vue
│   │   ├── Portfolio.vue
│   │   └── TradeHistory.vue
│   │
│   ├── charts/                            # Chart components
│   │   ├── LineChart.vue
│   │   ├── PieChart.vue
│   │   ├── BarChart.vue
│   │   └── CandlestickChart.vue
│   │
│   ├── gamification/                      # Gamification components
│   │   ├── XPBar.vue
│   │   ├── BadgeList.vue
│   │   ├── QuestCard.vue
│   │   └── LevelUpModal.vue
│   │
│   └── layout/                            # Layout components
│       ├── Header.vue
│       ├── Sidebar.vue
│       ├── Footer.vue
│       └── Notification.vue
│
├── composables/                            # Composables (reusable logic)
│   ├── useAuth.ts                         # Authentication
│   ├── useCrypto.ts                       # Crypto data
│   ├── useWebSocket.ts                    # WebSocket
│   ├── useNotification.ts                 # Notifications
│   ├── useTrade.ts                        # Trade operations
│   └── useGamification.ts                 # XP, badges, quests
│
├── stores/                                 # Pinia stores (state management)
│   ├── auth.ts
│   ├── crypto.ts
│   ├── portfolio.ts
│   ├── notification.ts
│   └── gamification.ts
│
├── lib/                                    # Libraries and utilities
│   ├── api.ts                             # API client (HTTP)
│   ├── socket.ts                          # Socket.IO client
│   └── utils.ts                           # Utility functions
│
├── types/                                  # TypeScript types
│   └── index.ts
│
├── assets/                                 # Static assets
│   ├── css/
│   │   └── main.css
│   └── images/
│
├── public/                                 # Public files
│   └── favicon.ico
│
├── tests/                                  # Tests
│   ├── components/
│   └── composables/
│
├── nuxt.config.ts                         # Nuxt configuration
├── tailwind.config.js                     # Tailwind configuration
├── tsconfig.json                          # TypeScript configuration
└── package.json                           # Dependencies
```

### Estrutura de Diretórios - Shared (Schemas Zod)

```
shared/
├── schemas/                                # Zod validation schemas
│   ├── auth.schema.ts                     # Login, register
│   ├── user.schema.ts                     # User profile
│   ├── trade.schema.ts                    # Trade operations
│   ├── crypto.schema.ts                   # Crypto data
│   ├── quest.schema.ts                    # Quests
│   └── index.ts                           # Export all schemas
│
├── types/                                  # Shared TypeScript types
│   └── index.ts
│
├── constants/                              # Shared constants
│   └── index.ts
│
├── tsconfig.json
└── package.json
```

### Arquitetura em Camadas (Layered Architecture)

```
┌─────────────────────────────────────┐
│      PRESENTATION LAYER             │  ← Controllers/Routes
│  (HTTP, WebSocket, GraphQL, etc)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        SERVICE LAYER                │  ← Business Logic
│    (Regras de negócio, lógica)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      REPOSITORY LAYER               │  ← Data Access
│   (Acesso ao banco, cache, APIs)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        DATA LAYER                   │  ← Database/Cache
│    (MongoDB, Redis, External APIs)  │
└─────────────────────────────────────┘
```

### Exemplo Prático - Feature de Trade

```typescript
// ============================================
// 1. PRESENTATION LAYER - Route/Controller
// ============================================
// backend/src/api/routes/trade.routes.ts

import { FastifyInstance } from 'fastify'
import { TradeController } from '../controllers/trade.controller'
import { authMiddleware } from '../middlewares/auth.middleware'
import { validateSchema } from '../middlewares/validation.middleware'
import { createTradeSchema } from '@gobsvault/shared/schemas'

export async function tradeRoutes(app: FastifyInstance) {
  const tradeController = new TradeController()
  
  app.post('/api/trades', {
    preHandler: [authMiddleware, validateSchema(createTradeSchema)]
  }, tradeController.create)
}

// ============================================
// 2. CONTROLLER (thin layer - apenas delega)
// ============================================
// backend/src/api/controllers/trade.controller.ts

import { TradeService } from '../../services/trade.service'

export class TradeController {
  private tradeService = new TradeService()
  
  create = async (req, reply) => {
    const trade = await this.tradeService.executeTrade(
      req.user.id,
      req.body
    )
    
    return reply.code(201).send(trade)
  }
}

// ============================================
// 3. SERVICE LAYER (business logic)
// ============================================
// backend/src/services/trade.service.ts

import { TradeRepository } from '../repositories/trade.repository'
import { PortfolioService } from './portfolio.service'
import { CryptoService } from './crypto.service'
import { GamificationService } from './gamification.service'
import { NotificationService } from './notification.service'

export class TradeService {
  constructor(
    private tradeRepository = new TradeRepository(),
    private portfolioService = new PortfolioService(),
    private cryptoService = new CryptoService(),
    private gamificationService = new GamificationService(),
    private notificationService = new NotificationService()
  ) {}
  
  async executeTrade(userId: string, tradeData: CreateTradeDto) {
    // 1. Busca preço atual
    const currentPrice = await this.cryptoService.getPrice(tradeData.symbol)
    
    // 2. Valida saldo suficiente
    const portfolio = await this.portfolioService.getByUserId(userId)
    const totalCost = currentPrice * tradeData.amount
    
    if (tradeData.type === 'BUY' && portfolio.balance < totalCost) {
      throw new InsufficientBalanceError()
    }
    
    // 3. Cria trade
    const trade = await this.tradeRepository.create({
      userId,
      ...tradeData,
      price: currentPrice,
      total: totalCost
    })
    
    // 4. Atualiza portfolio
    await this.portfolioService.updateAfterTrade(userId, trade)
    
    // 5. Adiciona XP
    const xpGained = await this.gamificationService.addXPForTrade(userId, trade)
    
    // 6. Verifica conquistas
    const newBadges = await this.gamificationService.checkBadges(userId)
    
    // 7. Notifica usuário
    if (xpGained > 0 || newBadges.length > 0) {
      await this.notificationService.notify(userId, {
        xpGained,
        newBadges
      })
    }
    
    return trade
  }
}

// ============================================
// 4. REPOSITORY LAYER (data access)
// ============================================
// backend/src/repositories/trade.repository.ts

import { Trade } from '../models/Trade.model'

export class TradeRepository {
  async create(data: CreateTradeDto) {
    return Trade.create(data)
  }
  
  async findByUserId(userId: string, limit = 50) {
    return Trade.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
  }
  
  async countByUserId(userId: string) {
    return Trade.countDocuments({ userId })
  }
}

// ============================================
// 5. DATA LAYER (Mongoose Model)
// ============================================
// backend/src/models/Trade.model.ts

import { Schema, model } from 'mongoose'

const tradeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  symbol: { type: String, required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, index: true }
})

tradeSchema.index({ userId: 1, createdAt: -1 })

export const Trade = model('Trade', tradeSchema)
```

### Benefícios desta Arquitetura

✅ **Separação de responsabilidades** - cada camada tem um papel claro  
✅ **Testabilidade** - fácil mockar dependências  
✅ **Manutenibilidade** - mudanças isoladas em camadas específicas  
✅ **Reusabilidade** - services podem ser usados por múltiplos controllers  
✅ **Escalabilidade** - fácil adicionar novas features sem quebrar existentes  

---

## 📝 Padrões de Código

### Naming Conventions

#### Variáveis e Funções - camelCase
```typescript
// ✅ BOM
const userName = 'Gobs'
const totalAmount = 1000
const isAuthenticated = true

function calculateXP() {}
function getUserById() {}
```

#### Classes e Interfaces - PascalCase
```typescript
// ✅ BOM
class UserService {}
class TradeController {}
interface CryptoPrice {}
type TradeType = 'BUY' | 'SELL'
```

#### Constantes - UPPER_SNAKE_CASE
```typescript
// ✅ BOM
const MAX_TRADES_PER_MINUTE = 10
const DEFAULT_CURRENCY = 'USD'
const API_BASE_URL = 'https://api.coingecko.com'
```

#### Arquivos - kebab-case
```
user.service.ts
trade.controller.ts
auth.middleware.ts
crypto-price.util.ts
```

#### Pastas - lowercase singular/plural conforme contexto
```
services/
models/
utils/
middlewares/
```

### Nomenclatura Significativa

```typescript
// ❌ RUIM - Nomes genéricos/abreviados
const d = new Date()
const tmp = user.data
function calc(a, b) {}

// ✅ BOM - Nomes descritivos
const currentDate = new Date()
const userPortfolio = user.data
function calculateTotalCost(price: number, quantity: number) {}

// ❌ RUIM - Muito verboso
const userAuthenticationTokenExpirationTimestampInMilliseconds = 900000

// ✅ BOM - Descritivo mas conciso
const tokenExpirationMs = 900000
```

### Booleans - Sempre começar com "is", "has", "can", "should"

```typescript
// ✅ BOM
const isAuthenticated = true
const hasPermission = false
const canTrade = true
const shouldNotify = false
const didComplete = true
```

### Funções - Verbos que descrevem ações

```typescript
// ✅ BOM
function getUser() {}
function createTrade() {}
function updateProfile() {}
function deleteAccount() {}
function validateInput() {}
function calculateXP() {}
function sendNotification() {}
```

### Formatação de Código

```typescript
// Sempre usar Prettier com configuração consistente
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}

// ESLint para regras adicionais
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn'
  }
}
```

---

## 🔷 TypeScript - Boas Práticas

### 1. SEMPRE tipar - Nunca usar `any`

```typescript
// ❌ RUIM
function processData(data: any) {
  return data.value
}

// ✅ BOM
interface TradeData {
  symbol: string
  amount: number
  type: 'BUY' | 'SELL'
}

function processData(data: TradeData): number {
  return data.amount
}

// Se realmente não souber o tipo, use unknown (mais seguro)
function handleUnknown(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase()
  }
}
```

### 2. Usar Interfaces para Objetos, Types para Unions/Primitivos

```typescript
// ✅ BOM - Interface para objetos
interface User {
  id: string
  username: string
  email: string
}

// ✅ BOM - Type para unions e tipos compostos
type TradeType = 'BUY' | 'SELL'
type Status = 'pending' | 'completed' | 'failed'
type UserOrNull = User | null
```

### 3. Usar Enums para valores constantes relacionados

```typescript
// ✅ BOM
enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL'
}

enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

// Uso
const trade: TradeType = TradeType.BUY
```

### 4. Utility Types do TypeScript

```typescript
// Partial - todos campos opcionais
interface User {
  id: string
  username: string
  email: string
}

type PartialUser = Partial<User>
// { id?: string, username?: string, email?: string }

// Pick - seleciona campos específicos
type UserCredentials = Pick<User, 'email' | 'password'>
// { email: string, password: string }

// Omit - remove campos
type UserWithoutPassword = Omit<User, 'password'>
// { id: string, username: string, email: string }

// Required - todos campos obrigatórios
type RequiredUser = Required<PartialUser>

// Record - objeto com chaves dinâmicas
type CryptoPrices = Record<string, number>
// { BTC: 45000, ETH: 3000, ... }
```

### 5. Generics para Reusabilidade

```typescript
// ✅ BOM - Função genérica
function findById<T>(collection: T[], id: string): T | undefined {
  return collection.find(item => item.id === id)
}

const users = [{ id: '1', name: 'Gobs' }]
const user = findById(users, '1') // TypeScript infere o tipo User

// ✅ BOM - Interface genérica
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

type UserResponse = ApiResponse<User>
type TradeResponse = ApiResponse<Trade[]>
```

### 6. Readonly para Imutabilidade

```typescript
// ✅ BOM
interface Config {
  readonly apiKey: string
  readonly baseUrl: string
}

const config: Config = {
  apiKey: 'abc123',
  baseUrl: 'https://api.com'
}

config.apiKey = 'new' // ❌ Erro: Cannot assign to 'apiKey' because it is a read-only property

// Readonly em arrays
const symbols: readonly string[] = ['BTC', 'ETH']
symbols.push('ADA') // ❌ Erro
```

### 7. Type Guards

```typescript
// ✅ BOM - Type guard personalizado
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.username === 'string'
}

function processEntity(entity: User | Trade) {
  if (isUser(entity)) {
    console.log(entity.username) // TypeScript sabe que é User
  } else {
    console.log(entity.symbol) // TypeScript sabe que é Trade
  }
}
```

### 8. Strict Mode - SEMPRE ativo

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

---

## ⚙️ Backend - Node.js + Fastify

### 1. Estrutura de um Route Handler

```typescript
// ✅ BOM - Estrutura completa
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

// Schema de validação
const createTradeSchema = z.object({
  symbol: z.string().min(2).max(10),
  amount: z.number().positive(),
  type: z.enum(['BUY', 'SELL'])
})

type CreateTradeBody = z.infer<typeof createTradeSchema>

// Handler
export async function createTrade(
  req: FastifyRequest<{ Body: CreateTradeBody }>,
  reply: FastifyReply
) {
  try {
    // Validação já feita por middleware
    const { symbol, amount, type } = req.body
    const userId = req.user.id
    
    // Business logic delegada ao service
    const trade = await tradeService.executeTrade(userId, { symbol, amount, type })
    
    return reply.code(201).send({
      success: true,
      data: trade
    })
  } catch (error) {
    // Error handling centralizado
    throw error
  }
}
```

### 2. Error Handling - Erros Customizados

```typescript
// ✅ BOM - Hierarquia de erros
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class InsufficientBalanceError extends AppError {
  constructor() {
    super('Insufficient balance', 400, 'INSUFFICIENT_BALANCE')
  }
}

// Global error handler
app.setErrorHandler((error, req, reply) => {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    })
  }
  
  // Erro inesperado
  logger.error(error)
  return reply.code(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  })
})
```

### 3. Middleware Pattern

```typescript
// ✅ BOM - Middleware reutilizável e composável
import { FastifyRequest, FastifyReply } from 'fastify'

// Auth middleware
export async function authMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const token = req.cookies.accessToken
  
  if (!token) {
    throw new UnauthorizedError('No token provided')
  }
  
  try {
    const payload = verifyJWT(token)
    
    // Verifica se token está na blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`)
    if (isBlacklisted) {
      throw new UnauthorizedError('Token invalidated')
    }
    
    req.user = payload
  } catch (error) {
    throw new UnauthorizedError('Invalid token')
  }
}

// Role-based access control
export function requireRole(...roles: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user) {
      throw new UnauthorizedError()
    }
    
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions')
    }
  }
}

// Uso combinado
app.post('/api/admin/users', {
  preHandler: [authMiddleware, requireRole('admin')]
}, adminController.createUser)
```

### 4. Dependency Injection

```typescript
// ✅ BOM - Injeção de dependências
class TradeService {
  constructor(
    private tradeRepository: TradeRepository,
    private cryptoService: CryptoService,
    private cacheService: CacheService
  ) {}
  
  async executeTrade(userId: string, data: TradeDto) {
    // Usa as dependências injetadas
    const price = await this.cryptoService.getPrice(data.symbol)
    // ...
  }
}

// Factory para criar instâncias com dependências
class ServiceFactory {
  private static instances = new Map()
  
  static getTradeService(): TradeService {
    if (!this.instances.has('TradeService')) {
      const tradeRepo = new TradeRepository()
      const cryptoService = this.getCryptoService()
      const cacheService = this.getCacheService()
      
      this.instances.set('TradeService', new TradeService(
        tradeRepo,
        cryptoService,
        cacheService
      ))
    }
    
    return this.instances.get('TradeService')
  }
}

// Uso
const tradeService = ServiceFactory.getTradeService()
```

### 5. Async/Await - Sempre

```typescript
// ❌ RUIM - Callbacks
function getUser(id, callback) {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
    if (err) {
      callback(err)
    } else {
      callback(null, result)
    }
  })
}

// ✅ BOM - Async/await
async function getUser(id: string): Promise<User> {
  const user = await User.findById(id)
  if (!user) {
    throw new NotFoundError('User')
  }
  return user
}

// Sempre use try/catch ou deixe o erro propagar
async function processUser(id: string) {
  try {
    const user = await getUser(id)
    // ...
  } catch (error) {
    // Handle error
    throw error
  }
}
```

### 6. Validação com Zod

```typescript
// ✅ BOM - Schema Zod compartilhado
// shared/schemas/trade.schema.ts
import { z } from 'zod'

export const createTradeSchema = z.object({
  symbol: z.string()
    .min(2, 'Symbol must be at least 2 characters')
    .max(10, 'Symbol must be at most 10 characters')
    .toUpperCase(),
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount too large'),
  type: z.enum(['BUY', 'SELL'])
})

export type CreateTradeDto = z.infer<typeof createTradeSchema>

// Middleware de validação
export function validateSchema<T>(schema: z.ZodSchema<T>) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      req.body = schema.parse(req.body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          error.errors.map(e => `${e.path}: ${e.message}`).join(', ')
        )
      }
      throw error
    }
  }
}

// Uso
app.post('/api/trades', {
  preHandler: [authMiddleware, validateSchema(createTradeSchema)]
}, tradeController.create)
```

### 7. Rate Limiting por Endpoint

```typescript
// ✅ BOM - Rate limit configurável
import rateLimit from '@fastify/rate-limit'

// Global rate limit
app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  cache: 10000,
  redis: redisClient // Usa Redis para compartilhar entre instâncias
})

// Rate limit específico
app.post('/api/auth/login', {
  config: {
    rateLimit: {
      max: 5,
      timeWindow: '15 minutes',
      errorResponseBuilder: () => ({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many login attempts. Try again in 15 minutes.'
        }
      })
    }
  }
}, loginHandler)

app.post('/api/trades', {
  config: {
    rateLimit: {
      max: 10,
      timeWindow: '1 minute'
    }
  }
}, tradeHandler)
```

---

## 💚 Frontend - Nuxt 4 + Vue 3

### 1. Single File Components (SFC) - SEMPRE

```vue
<!-- ✅ BOM - Composition API com <script setup> -->
<!-- components/UserProfile.vue -->
<script setup lang="ts">
const { data: user, pending } = await useFetch<User>('/api/users/me')
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="user">Welcome, {{ user.username }}!</div>
  <div v-else>Not logged in</div>
</template>

<style scoped>
/* Estilos scoped (não vazam para outros componentes) */
</style>
```

### 2. Composables para Lógica Reutilizável

```typescript
// ✅ BOM - Composable
// composables/useAuth.ts
export const useAuth = () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  
  const checkAuth = async () => {
    try {
      user.value = await $fetch('/api/auth/me')
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }
  
  const login = async (email: string, password: string) => {
    user.value = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
  }
  
  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }
  
  // Auto-executa na inicialização
  onMounted(() => checkAuth())
  
  return { user, loading, login, logout }
}

// Uso no componente
// pages/dashboard.vue
<script setup lang="ts">
const { user, loading } = useAuth()
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="user">Welcome, {{ user.username }}!</div>
  <div v-else>Please login</div>
</template>
```

### 3. computed e watch - Reatividade

```vue
<!-- ✅ BOM - Computed properties -->
<script setup lang="ts">
interface Trade {
  id: string
  total: number
}

const trades = ref<Trade[]>([])

// Computed para cálculos derivados (cacheia automaticamente)
const totalValue = computed(() => {
  return trades.value.reduce((sum, trade) => sum + trade.total, 0)
})

// Watch para efeitos colaterais
watch(totalValue, (newValue, oldValue) => {
  console.log(`Portfolio mudou de ${oldValue} para ${newValue}`)
})

// WatchEffect para dependências automáticas
watchEffect(() => {
  console.log(`Total atual: ${totalValue.value}`)
})
</script>

<template>
  <div>
    <h2>Total: ${{ totalValue }}</h2>
    <div v-for="trade in trades" :key="trade.id">
      <!-- ... -->
    </div>
  </div>
</template>
```

### 4. v-model Two-Way Binding

```vue
<!-- ✅ BOM - Formulários reativos -->
<script setup lang="ts">
const form = reactive({
  symbol: 'BTC',
  amount: 0,
  type: 'BUY' as 'BUY' | 'SELL'
})

const handleSubmit = async () => {
  await $fetch('/api/trades', {
    method: 'POST',
    body: form
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <!-- v-model = two-way binding -->
    <input v-model="form.symbol" type="text" />
    <input v-model.number="form.amount" type="number" />
    
    <select v-model="form.type">
      <option value="BUY">Buy</option>
      <option value="SELL">Sell</option>
    </select>
    
    <button type="submit">Trade</button>
  </form>
</template>
```

### 5. Pinia - State Management Global

```typescript
// ✅ BOM - Pinia store
// stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(false)
  
  // Getters (computed)
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role)
  
  // Actions
  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      user.value = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
    } finally {
      loading.value = false
    }
  }
  
  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }
  
  return { user, loading, isAuthenticated, userRole, login, logout }
})

// Uso no componente
<script setup lang="ts">
const authStore = useAuthStore()

authStore.login('user@example.com', 'password')
</script>

<template>
  <div v-if="authStore.isAuthenticated">
    Welcome, {{ authStore.user?.username }}!
  </div>
</template>
```

### 6. Nuxt UI Components

```vue
<!-- ✅ BOM - Usar componentes do Nuxt UI -->
<script setup lang="ts">
const toast = useToast()

const handleSuccess = () => {
  toast.add({
    title: 'Success',
    description: 'Trade executed successfully',
    color: 'green'
  })
}
</script>

<template>
  <!-- Button do Nuxt UI -->
  <UButton 
    color="primary" 
    size="lg"
    @click="handleSuccess"
  >
    Execute Trade
  </UButton>
  
  <!-- Card do Nuxt UI -->
  <UCard>
    <template #header>
      <h3>Portfolio</h3>
    </template>
    
    <p>Your current balance: $10,000</p>
    
    <template #footer>
      <UButton>View Details</UButton>
    </template>
  </UCard>
  
  <!-- Modal do Nuxt UI -->
  <UModal v-model="isOpen">
    <UCard>
      <h2>Confirm Trade</h2>
      <p>Are you sure?</p>
      
      <div class="flex gap-2">
        <UButton @click="confirm">Confirm</UButton>
        <UButton color="gray" @click="isOpen = false">Cancel</UButton>
      </div>
    </UCard>
  </UModal>
</template>
```

### 7. Lazy Loading e Code Splitting

```vue
<!-- ✅ BOM - Lazy load de componentes pesados -->
<script setup lang="ts">
// Componente carregado apenas quando usado
const HeavyChart = defineAsyncComponent(() => 
  import('~/components/charts/HeavyChart.vue')
)

const showChart = ref(false)
</script>

<template>
  <div>
    <button @click="showChart = true">Show Chart</button>
    
    <!-- Lazy load com Suspense -->
    <Suspense v-if="showChart">
      <template #default>
        <HeavyChart />
      </template>
      <template #fallback>
        <div>Loading chart...</div>
      </template>
    </Suspense>
  </div>
</template>

<!-- Lazy loading de páginas (automático no Nuxt) -->
<!-- pages/dashboard.vue -->
<!-- Carrega apenas quando acessada -->
```

### 8. useFetch e useAsyncData - Data Fetching

```vue
<!-- ✅ BOM - Nuxt data fetching com cache -->
<script setup lang="ts">
// useFetch = simplificado (GET requests)
const { data: cryptos, pending, refresh } = await useFetch('/api/crypto/prices', {
  // Cache por 60 segundos
  key: 'crypto-prices',
  // Re-fetch a cada 10 segundos
  watch: false,
  server: false // Apenas client-side (SPA mode)
})

// useAsyncData = mais controle
const { data: portfolio } = await useAsyncData(
  'user-portfolio',
  () => $fetch(`/api/portfolio/${userId.value}`),
  {
    // Refetch quando userId mudar
    watch: [userId]
  }
)
</script>

<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else>
      <div v-for="crypto in cryptos" :key="crypto.symbol">
        {{ crypto.symbol }}: ${{ crypto.price }}
      </div>
    </div>
    
    <button @click="refresh">Refresh Prices</button>
  </div>
</template>
```

### 9. Nuxt 4 - SPA Configuration

```typescript
// ✅ BOM - nuxt.config.ts para SPA
export default defineNuxtConfig({
  // SPA mode
  ssr: false,
  
  // Modules
  modules: [
    '@nuxt/ui',
    'nuxt-charts'
  ],
  
  // Runtime config (variáveis de ambiente)
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:4000'
    }
  },
  
  // App config
  app: {
    head: {
      title: 'GobsVault',
      meta: [
        { name: 'description', content: 'Trading de criptomoedas gamificado' }
      ]
    }
  },
  
  // TypeScript
  typescript: {
    strict: true,
    typeCheck: true
  }
})
```

### 10. Middleware de Autenticação

```typescript
// ✅ BOM - Middleware global
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Rotas públicas
  const publicRoutes = ['/auth/login', '/auth/register']
  
  if (!authStore.isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo('/auth/login')
  }
  
  // Se já autenticado e tenta acessar login
  if (authStore.isAuthenticated && publicRoutes.includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
```

### 11. Error Handling no Vue

```vue
<!-- ✅ BOM - Error handling em componentes -->
<script setup lang="ts">
const error = ref<string | null>(null)

const handleTrade = async () => {
  error.value = null
  try {
    await $fetch('/api/trades', {
      method: 'POST',
      body: tradeData
    })
  } catch (err: any) {
    error.value = err.data?.message || 'An error occurred'
    
    // Toast notification
    useToast().add({
      title: 'Error',
      description: error.value,
      color: 'red'
    })
  }
}

// Error handler global
onErrorCaptured((err) => {
  console.error('Component error:', err)
  return false // Propaga erro
})
</script>

<template>
  <div>
    <UAlert v-if="error" color="red" :title="error" />
    <!-- ... -->
  </div>
</template>
```

---

## 🗄️ Banco de Dados - MongoDB

### 1. Schema Design - Mongoose

```typescript
// ✅ BOM - Schema bem estruturado
import { Schema, model, Document } from 'mongoose'

// Interface TypeScript
export interface IUser extends Document {
  username: string
  email: string
  password: string
  balance: number
  xp: number
  level: number
  createdAt: Date
  updatedAt: Date
}

// Schema Mongoose
const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username must be at most 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: true,
    select: false // Nunca retorna em queries por padrão
  },
  balance: {
    type: Number,
    default: 10000,
    min: 0
  },
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  timestamps: true, // Cria createdAt e updatedAt automaticamente
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password // Remove password ao converter para JSON
      delete ret.__v
      return ret
    }
  }
})

// Indexes para performance
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })
userSchema.index({ xp: -1 }) // Para leaderboard (desc)

// Virtual para cálculo dinâmico
userSchema.virtual('nextLevelXP').get(function() {
  return 100 * Math.pow(1.5, this.level)
})

// Middleware (hooks)
userSchema.pre('save', async function(next) {
  // Hash password se foi modificado
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  next()
})

// Métodos de instância
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Métodos estáticos
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() })
}

export const User = model<IUser>('User', userSchema)
```

### 2. Queries Otimizadas

```typescript
// ❌ RUIM - Busca todos os campos desnecessariamente
const user = await User.findById(userId)

// ✅ BOM - Select apenas campos necessários
const user = await User.findById(userId).select('username xp level')

// ❌ RUIM - N+1 queries
const trades = await Trade.find({ userId })
for (const trade of trades) {
  trade.user = await User.findById(trade.userId) // Query por cada trade!
}

// ✅ BOM - Populate em uma query
const trades = await Trade.find({ userId })
  .populate('userId', 'username avatar')
  .lean() // Retorna objetos simples (mais rápido)

// ❌ RUIM - Busca tudo na memória e filtra
const users = await User.find()
const activeUsers = users.filter(u => u.xp > 1000)

// ✅ BOM - Filtra no banco
const activeUsers = await User.find({ xp: { $gt: 1000 } })
  .select('username xp')
  .limit(100)
  .lean()
```

### 3. Transactions para Operações Atômicas

```typescript
// ✅ BOM - Transaction para garantir consistência
import { startSession } from 'mongoose'

async function executeTrade(userId: string, tradeData: TradeDto) {
  const session = await startSession()
  session.startTransaction()
  
  try {
    // 1. Cria trade
    const [trade] = await Trade.create([tradeData], { session })
    
    // 2. Atualiza balance do usuário
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: -trade.total } },
      { session, new: true }
    )
    
    if (user.balance < 0) {
      throw new InsufficientBalanceError()
    }
    
    // 3. Atualiza portfolio
    await Portfolio.findOneAndUpdate(
      { userId },
      { $inc: { [`holdings.${trade.symbol}`]: trade.amount } },
      { session, upsert: true }
    )
    
    // Commit transaction
    await session.commitTransaction()
    
    return trade
  } catch (error) {
    // Rollback em caso de erro
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}
```

### 4. Aggregation Pipeline para Queries Complexas

```typescript
// ✅ BOM - Aggregation para leaderboard
async function getLeaderboard(limit = 100) {
  return User.aggregate([
    // 1. Filtra usuários com XP > 0
    { $match: { xp: { $gt: 0 } } },
    
    // 2. Ordena por XP decrescente
    { $sort: { xp: -1 } },
    
    // 3. Limita resultados
    { $limit: limit },
    
    // 4. Projeta apenas campos necessários
    {
      $project: {
        _id: 1,
        username: 1,
        xp: 1,
        level: 1,
        avatar: 1
      }
    },
    
    // 5. Adiciona ranking position
    {
      $group: {
        _id: null,
        users: { $push: '$$ROOT' }
      }
    },
    {
      $unwind: { path: '$users', includeArrayIndex: 'rank' }
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ['$users', { rank: { $add: ['$rank', 1] } }]
        }
      }
    }
  ])
}

// Aggregation para analytics
async function getUserStats(userId: string) {
  return Trade.aggregate([
    { $match: { userId: new Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalValue: { $sum: '$total' },
        avgPrice: { $avg: '$price' }
      }
    }
  ])
}
```

### 5. Indexes para Performance

```typescript
// ✅ BOM - Indexes estratégicos
// User
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ username: 1 }, { unique: true })
userSchema.index({ xp: -1 }) // Leaderboard

// Trade
tradeSchema.index({ userId: 1, createdAt: -1 }) // Histórico de usuário
tradeSchema.index({ symbol: 1, createdAt: -1 }) // Histórico por moeda
tradeSchema.index({ type: 1, createdAt: -1 }) // Filtro por tipo

// Portfolio
portfolioSchema.index({ userId: 1 }, { unique: true })

// Compound index para queries específicas
tradeSchema.index({ userId: 1, symbol: 1, createdAt: -1 })
```

### 6. Soft Delete ao invés de Hard Delete

```typescript
// ✅ BOM - Soft delete (flag deletedAt)
const userSchema = new Schema({
  // ...
  deletedAt: {
    type: Date,
    default: null
  }
})

// Middleware para filtrar automaticamente
userSchema.pre(/^find/, function(next) {
  // @ts-ignore
  this.where({ deletedAt: null })
  next()
})

// Método para soft delete
userSchema.methods.softDelete = async function() {
  this.deletedAt = new Date()
  await this.save()
}

// Hard delete apenas se necessário
userSchema.methods.hardDelete = async function() {
  await this.remove()
}
```

---

## 🚀 Cache - Redis

### 1. Estratégias de Cache

```typescript
// ✅ BOM - Cache service abstrato
export class CacheService {
  constructor(private redis: Redis) {}
  
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }
  
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value))
  }
  
  async del(key: string): Promise<void> {
    await this.redis.del(key)
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
}

// Uso com Cache-Aside Pattern
async function getCryptoPrice(symbol: string): Promise<number> {
  const cacheKey = `crypto:price:${symbol}`
  
  // 1. Tenta buscar do cache
  const cached = await cacheService.get<number>(cacheKey)
  if (cached !== null) {
    return cached
  }
  
  // 2. Se não existe, busca da API
  const price = await coinGeckoAPI.getPrice(symbol)
  
  // 3. Salva no cache (TTL: 60 segundos)
  await cacheService.set(cacheKey, price, 60)
  
  return price
}
```

### 2. Cache de Queries MongoDB

```typescript
// ✅ BOM - Cache de queries pesadas
async function getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  const cacheKey = `leaderboard:global:${limit}`
  
  // Tenta do cache primeiro
  const cached = await cacheService.get<LeaderboardEntry[]>(cacheKey)
  if (cached) {
    return cached
  }
  
  // Query no MongoDB
  const leaderboard = await User.find({ xp: { $gt: 0 } })
    .select('username xp level avatar')
    .sort({ xp: -1 })
    .limit(limit)
    .lean()
  
  // Cache por 5 minutos
  await cacheService.set(cacheKey, leaderboard, 300)
  
  return leaderboard
}

// Invalidação ao atualizar XP
async function addXP(userId: string, amount: number) {
  await User.findByIdAndUpdate(userId, { $inc: { xp: amount } })
  
  // Invalida cache do leaderboard
  await cacheService.invalidatePattern('leaderboard:*')
}
```

### 3. Session Storage

```typescript
// ✅ BOM - Armazenar sessões no Redis
async function createSession(userId: string, data: SessionData) {
  const sessionId = crypto.randomUUID()
  const key = `session:${sessionId}`
  
  await redis.setex(
    key,
    900, // 15 minutos
    JSON.stringify({ userId, ...data })
  )
  
  return sessionId
}

async function getSession(sessionId: string): Promise<SessionData | null> {
  const data = await redis.get(`session:${sessionId}`)
  return data ? JSON.parse(data) : null
}

async function deleteSession(sessionId: string) {
  await redis.del(`session:${sessionId}`)
}
```

### 4. Rate Limiting com Redis

```typescript
// ✅ BOM - Rate limiting distribuído
async function checkRateLimit(
  userId: string,
  endpoint: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const key = `ratelimit:${userId}:${endpoint}`
  
  const current = await redis.incr(key)
  
  if (current === 1) {
    // Primeira request - define TTL
    await redis.expire(key, windowSeconds)
  }
  
  return current <= maxRequests
}

// Middleware
async function rateLimitMiddleware(req, reply) {
  const userId = req.user?.id || req.ip
  const endpoint = req.routerPath
  
  const allowed = await checkRateLimit(userId, endpoint, 10, 60)
  
  if (!allowed) {
    throw new RateLimitError('Too many requests')
  }
}
```

### 5. Pub/Sub para Comunicação entre Instâncias

```typescript
// ✅ BOM - Pub/Sub para invalidação de cache distribuído
class CachePubSub {
  private publisher: Redis
  private subscriber: Redis
  
  constructor() {
    this.publisher = new Redis(process.env.REDIS_URL)
    this.subscriber = new Redis(process.env.REDIS_URL)
    
    this.subscriber.subscribe('cache:invalidate')
    this.subscriber.on('message', this.handleMessage.bind(this))
  }
  
  async invalidate(pattern: string) {
    // Invalida localmente
    await cacheService.invalidatePattern(pattern)
    
    // Notifica outras instâncias
    await this.publisher.publish('cache:invalidate', pattern)
  }
  
  private async handleMessage(channel: string, pattern: string) {
    if (channel === 'cache:invalidate') {
      await cacheService.invalidatePattern(pattern)
    }
  }
}
```

---

## 🔌 WebSocket - Socket.IO

### 1. Estrutura de Events

```typescript
// ✅ BOM - Tipagem forte de eventos
// shared/types/socket.types.ts
export interface ServerToClientEvents {
  'price:update': (data: { symbol: string; price: number }[]) => void
  'notification': (data: Notification) => void
  'leaderboard:update': (data: LeaderboardEntry[]) => void
  'user:levelup': (data: { newLevel: number; xp: number }) => void
}

export interface ClientToServerEvents {
  'subscribe:prices': (symbols: string[]) => void
  'unsubscribe:prices': (symbols: string[]) => void
}

// Backend
import { Server } from 'socket.io'

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
})

// Frontend
import { io, Socket } from 'socket.io-client'

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.NEXT_PUBLIC_API_URL
)
```

### 2. Autenticação WebSocket

```typescript
// ✅ BOM - Middleware de autenticação
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    
    if (!token) {
      return next(new Error('Authentication required'))
    }
    
    const payload = verifyJWT(token)
    socket.data.userId = payload.userId
    socket.data.username = payload.username
    
    next()
  } catch (error) {
    next(new Error('Invalid token'))
  }
})

// Frontend
const socket = io(API_URL, {
  auth: {
    token: getAccessToken()
  }
})
```

### 3. Rooms para Segmentação

```typescript
// ✅ BOM - Usuários em rooms específicas
io.on('connection', (socket) => {
  const userId = socket.data.userId
  
  // Cada usuário tem sua room pessoal
  socket.join(`user:${userId}`)
  
  // Notificar apenas este usuário
  function notifyUser(userId: string, notification: Notification) {
    io.to(`user:${userId}`).emit('notification', notification)
  }
  
  // Subscribe em preços
  socket.on('subscribe:prices', (symbols) => {
    symbols.forEach(symbol => {
      socket.join(`price:${symbol}`)
    })
  })
  
  // Broadcast preços apenas para quem está subscrito
  function broadcastPrices(symbol: string, price: number) {
    io.to(`price:${symbol}`).emit('price:update', [{ symbol, price }])
  }
})
```

### 4. Throttling de Updates

```typescript
// ✅ BOM - Não sobrecarregar clientes com updates
let priceCache: Record<string, number> = {}
let lastBroadcast = Date.now()

async function updatePrices() {
  // Busca preços da API
  const prices = await fetchCryptoPrices()
  priceCache = prices
}

// Broadcast a cada 2 segundos (não a cada tick)
setInterval(() => {
  if (Object.keys(priceCache).length > 0) {
    io.emit('price:update', Object.entries(priceCache).map(([symbol, price]) => ({
      symbol,
      price
    })))
  }
}, 2000)

// Atualiza cache a cada 10 segundos
setInterval(updatePrices, 10000)
```

### 5. Error Handling e Reconnection

```typescript
// Frontend - ✅ BOM - Lidar com desconexões
socket.on('connect', () => {
  console.log('Connected to server')
  // Re-subscribe em rooms se necessário
  socket.emit('subscribe:prices', ['BTC', 'ETH'])
})

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason)
  
  if (reason === 'io server disconnect') {
    // Server desconectou - reconectar manualmente
    socket.connect()
  }
  // Socket.IO reconecta automaticamente em outros casos
})

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message)
  
  if (error.message === 'Invalid token') {
    // Token expirado - renovar
    refreshToken().then(newToken => {
      socket.auth.token = newToken
      socket.connect()
    })
  }
})

// Configuração de reconnection
const socket = io(API_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000
})
```

---

## 🔒 Segurança - OWASP

### 1. Injection Prevention

```typescript
// ✅ BOM - Validação rigorosa com Zod
import { z } from 'zod'
import mongoSanitize from 'express-mongo-sanitize'

// Schema Zod previne injection
const userSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  username: z.string()
    .min(3).max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'Only alphanumeric and underscore')
})

// Sanitiza MongoDB operators
app.use(mongoSanitize())

// ❌ NUNCA use eval ou Function constructor
// eval(userInput) // NUNCA FAÇA ISSO

// ❌ NUNCA concatene strings em queries
// const query = `SELECT * FROM users WHERE email = '${email}'` // SQL Injection

// ✅ BOM - Mongoose já previne NoSQL injection
User.find({ email: req.body.email }) // Seguro
```

### 2. Authentication & Session Management

```typescript
// ✅ BOM - JWT com refresh tokens
async function login(email: string, password: string) {
  const user = await User.findOne({ email }).select('+password')
  
  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthorizedError('Invalid credentials')
  }
  
  // Access token (curta duração)
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  )
  
  // Refresh token (longa duração)
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  )
  
  // Salva refresh token no Redis (permite invalidação)
  await redis.setex(
    `refresh:${user.id}`,
    604800, // 7 dias
    refreshToken
  )
  
  return { accessToken, refreshToken }
}

// HttpOnly Cookies
reply.setCookie('accessToken', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 900000 // 15min
})

reply.setCookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 604800000, // 7 dias
  path: '/api/auth/refresh' // Apenas este endpoint
})
```

### 3. XSS Prevention

```vue
<!-- ✅ BOM - Vue já escapa HTML automaticamente -->
<script setup lang="ts">
interface Props {
  comment: string
}
defineProps<Props>()
</script>

<template>
  <!-- Seguro - Vue escapa automaticamente -->
  <div>{{ comment }}</div>
</template>

<!-- ❌ NUNCA use v-html com input do usuário -->
<script setup lang="ts">
const userHtml = ref('<script>alert("XSS")</script>')
</script>

<template>
  <!-- ❌ XSS risk -->
  <div v-html="userHtml"></div>
</template>

<!-- Se REALMENTE precisar renderizar HTML: -->
<script setup lang="ts">
import DOMPurify from 'dompurify'

interface Props {
  html: string
}

const props = defineProps<Props>()
const sanitizedHtml = computed(() => DOMPurify.sanitize(props.html))
</script>

<template>
  <div v-html="sanitizedHtml"></div>
</template>
```

```typescript
// Content Security Policy (CSP)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.API_URL]
    }
  }
}))
```

### 4. CSRF Protection

```typescript
// ✅ BOM - SameSite cookies (primeira linha de defesa)
reply.setCookie('accessToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' // Previne CSRF
})

// Para proteção adicional: CSRF Token
import csrf from '@fastify/csrf-protection'

app.register(csrf)

// Endpoint retorna token
app.get('/api/csrf-token', async (req, reply) => {
  const token = await reply.generateCsrf()
  return { csrfToken: token }
})

// Valida token em mutations
app.post('/api/trades', {
  preHandler: [authMiddleware, verifyCsrf]
}, tradeHandler)
```

### 5. Sensitive Data Exposure

```typescript
// ✅ BOM - NUNCA exponha dados sensíveis
const userSchema = new Schema({
  password: {
    type: String,
    required: true,
    select: false // Nunca retorna em queries
  },
  apiKey: {
    type: String,
    select: false
  }
})

// Transform ao serializar JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password
    delete ret.apiKey
    delete ret.__v
    return ret
  }
})

// Nunca logue senhas ou tokens
logger.info({ userId: user.id }, 'User logged in') // ✅
logger.info({ password: user.password }, 'Login') // ❌ NUNCA

// Variáveis de ambiente para secrets
// ❌ NUNCA commite secrets
const apiKey = 'sk_live_abc123' // ❌

// ✅ BOM - Use .env
const apiKey = process.env.API_KEY
```

### 6. Security Misconfiguration

```typescript
// ✅ BOM - Configuração segura
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'

// Helmet para headers de segurança
app.register(helmet, {
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000 },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
})

// CORS restritivo
app.register(cors, {
  origin: process.env.FRONTEND_URL, // NUNCA '*'
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})

// Desabilita informações de versão
app.removeHeader('X-Powered-By')

// Limita tamanho de payloads
app.register(fastifyPlugin, {
  bodyLimit: 1048576 // 1MB
})
```

### 7. Using Components with Known Vulnerabilities

```bash
# ✅ BOM - Auditar dependências regularmente
npm audit
npm audit fix

# Dependabot no GitHub
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

### 8. Insufficient Logging & Monitoring

```typescript
// ✅ BOM - Logging estruturado com Pino
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label }
    }
  }
})

// Log de eventos importantes
logger.info({ userId, action: 'login' }, 'User logged in')
logger.warn({ userId, attempts: 5 }, 'Multiple failed login attempts')
logger.error({ error, userId }, 'Trade execution failed')

// Audit log para ações críticas
await AuditLog.create({
  userId,
  action: 'TRADE_EXECUTED',
  details: { symbol: 'BTC', amount: 0.5 },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
})

// Monitoramento com Sentry
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
})

app.setErrorHandler((error, req, reply) => {
  Sentry.captureException(error, {
    user: { id: req.user?.id },
    tags: { endpoint: req.routerPath }
  })
  
  // ...
})
```

---

## ⚡ Performance e Otimização

### 1. Database Query Optimization

```typescript
// ❌ RUIM - N+1 problem
async function getTradesWithUsers() {
  const trades = await Trade.find().limit(100)
  
  for (const trade of trades) {
    trade.user = await User.findById(trade.userId) // 100 queries!
  }
  
  return trades
}

// ✅ BOM - Populate em uma query
async function getTradesWithUsers() {
  return Trade.find()
    .populate('userId', 'username avatar')
    .limit(100)
    .lean() // Retorna objetos simples (mais rápido)
}

// ❌ RUIM - Busca tudo e filtra na aplicação
async function getTopTraders() {
  const users = await User.find()
  return users
    .filter(u => u.xp > 1000)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 100)
}

// ✅ BOM - Filtra e ordena no banco
async function getTopTraders() {
  return User.find({ xp: { $gt: 1000 } })
    .select('username xp level')
    .sort({ xp: -1 })
    .limit(100)
    .lean()
}

// ✅ BOM - Projection para reduzir dados transferidos
const user = await User.findById(id).select('username xp level') // Apenas 3 campos
```

### 2. Caching Strategy

```typescript
// ✅ BOM - Multi-layer caching
async function getCryptoPrice(symbol: string): Promise<number> {
  // 1. Memória (mais rápido)
  if (memoryCache.has(symbol)) {
    return memoryCache.get(symbol)
  }
  
  // 2. Redis (rápido)
  const cached = await redis.get(`price:${symbol}`)
  if (cached) {
    const price = JSON.parse(cached)
    memoryCache.set(symbol, price)
    return price
  }
  
  // 3. API Externa (lento)
  const price = await coinGeckoAPI.getPrice(symbol)
  
  // Salva em ambos caches
  await redis.setex(`price:${symbol}`, 60, JSON.stringify(price))
  memoryCache.set(symbol, price)
  
  return price
}
```

### 3. Batch Operations

```typescript
// ❌ RUIM - Múltiplas queries
for (const userId of userIds) {
  await User.findByIdAndUpdate(userId, { $inc: { xp: 10 } })
}

// ✅ BOM - Batch update
await User.updateMany(
  { _id: { $in: userIds } },
  { $inc: { xp: 10 } }
)

// ❌ RUIM - Múltiplos inserts
for (const trade of trades) {
  await Trade.create(trade)
}

// ✅ BOM - Bulk insert
await Trade.insertMany(trades)
```

### 4. Pagination

```typescript
// ✅ BOM - Cursor-based pagination
async function getTrades(userId: string, cursor?: string, limit = 50) {
  const query: any = { userId }
  
  if (cursor) {
    query._id = { $lt: cursor } // Cursor = último _id visto
  }
  
  const trades = await Trade.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean()
  
  const hasMore = trades.length > limit
  const results = hasMore ? trades.slice(0, limit) : trades
  const nextCursor = hasMore ? results[results.length - 1]._id : null
  
  return { trades: results, nextCursor, hasMore }
}

// Offset pagination (mais simples, menos eficiente)
async function getTradesOffset(userId: string, page = 1, limit = 50) {
  const skip = (page - 1) * limit
  
  const [trades, total] = await Promise.all([
    Trade.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Trade.countDocuments({ userId })
  ])
  
  return {
    trades,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }
}
```

### 5. Connection Pooling

```typescript
// ✅ BOM - MongoDB connection pooling
import mongoose from 'mongoose'

mongoose.connect(process.env.MONGODB_URI!, {
  maxPoolSize: 10, // Máximo de conexões simultâneas
  minPoolSize: 2,  // Mínimo de conexões mantidas
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000
})

// Redis connection pooling
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false
})
```

### 6. Compression

```typescript
// ✅ BOM - Response compression
import compression from '@fastify/compress'

app.register(compression, {
  global: true,
  threshold: 1024, // Apenas responses > 1KB
  encodings: ['gzip', 'deflate']
})

// WebSocket compression
const io = new Server(server, {
  perMessageDeflate: true // Comprime mensagens grandes
})
```

---

## 🧪 Testes

### 1. Estrutura de Testes

```
backend/
└── src/
    └── tests/
        ├── unit/              # Testes unitários (funções isoladas)
        ├── integration/       # Testes de integração (banco, APIs)
        └── e2e/              # Testes end-to-end (fluxo completo)

frontend/
└── tests/
    ├── components/        # Testes de componentes
    ├── hooks/            # Testes de hooks
    └── integration/      # Testes de integração
```

### 2. Testes Unitários - Backend

```typescript
// ✅ BOM - Teste unitário com mocks
// services/trade.service.test.ts
import { TradeService } from './trade.service'
import { TradeRepository } from '../repositories/trade.repository'
import { CryptoService } from './crypto.service'

// Mocks
jest.mock('../repositories/trade.repository')
jest.mock('./crypto.service')

describe('TradeService', () => {
  let tradeService: TradeService
  let mockTradeRepository: jest.Mocked<TradeRepository>
  let mockCryptoService: jest.Mocked<CryptoService>
  
  beforeEach(() => {
    mockTradeRepository = new TradeRepository() as jest.Mocked<TradeRepository>
    mockCryptoService = new CryptoService() as jest.Mocked<CryptoService>
    tradeService = new TradeService(mockTradeRepository, mockCryptoService)
  })
  
  describe('executeTrade', () => {
    it('should execute buy trade successfully', async () => {
      // Arrange
      const userId = 'user123'
      const tradeData = { symbol: 'BTC', amount: 0.5, type: 'BUY' }
      const currentPrice = 45000
      
      mockCryptoService.getPrice.mockResolvedValue(currentPrice)
      mockTradeRepository.create.mockResolvedValue({
        id: 'trade123',
        ...tradeData,
        price: currentPrice,
        total: currentPrice * tradeData.amount
      })
      
      // Act
      const result = await tradeService.executeTrade(userId, tradeData)
      
      // Assert
      expect(result).toMatchObject({
        symbol: 'BTC',
        amount: 0.5,
        price: 45000,
        total: 22500
      })
      expect(mockCryptoService.getPrice).toHaveBeenCalledWith('BTC')
      expect(mockTradeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          symbol: 'BTC',
          amount: 0.5
        })
      )
    })
    
    it('should throw error when insufficient balance', async () => {
      // Arrange
      const userId = 'user123'
      const tradeData = { symbol: 'BTC', amount: 100, type: 'BUY' }
      
      mockCryptoService.getPrice.mockResolvedValue(45000)
      // Mock portfolio com saldo insuficiente
      
      // Act & Assert
      await expect(
        tradeService.executeTrade(userId, tradeData)
      ).rejects.toThrow(InsufficientBalanceError)
    })
  })
})
```

### 3. Testes de Integração - Backend

```typescript
// ✅ BOM - Teste de integração com banco real
// api/routes/trade.routes.test.ts
import { build } from '../../../app'
import { FastifyInstance } from 'fastify'
import { User } from '../../../models/User.model'
import { Trade } from '../../../models/Trade.model'

describe('POST /api/trades', () => {
  let app: FastifyInstance
  let authToken: string
  let userId: string
  
  beforeAll(async () => {
    app = await build()
    await app.ready()
  })
  
  afterAll(async () => {
    await app.close()
  })
  
  beforeEach(async () => {
    // Setup - cria usuário de teste
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      balance: 10000
    })
    
    userId = user.id
    
    // Gera token de autenticação
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'test@example.com',
        password: 'password123'
      }
    })
    
    authToken = response.cookies[0].value
  })
  
  afterEach(async () => {
    // Cleanup
    await User.deleteMany({})
    await Trade.deleteMany({})
  })
  
  it('should create trade successfully', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/trades',
      cookies: { accessToken: authToken },
      payload: {
        symbol: 'BTC',
        amount: 0.5,
        type: 'BUY'
      }
    })
    
    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        symbol: 'BTC',
        amount: 0.5,
        type: 'BUY'
      }
    })
    
    // Verifica que foi salvo no banco
    const trades = await Trade.find({ userId })
    expect(trades).toHaveLength(1)
    expect(trades[0].symbol).toBe('BTC')
  })
  
  it('should return 401 without authentication', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/trades',
      payload: {
        symbol: 'BTC',
        amount: 0.5,
        type: 'BUY'
      }
    })
    
    expect(response.statusCode).toBe(401)
  })
  
  it('should return 400 with invalid data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/trades',
      cookies: { accessToken: authToken },
      payload: {
        symbol: 'BTC',
        amount: -1, // Inválido
        type: 'BUY'
      }
    })
    
    expect(response.statusCode).toBe(400)
  })
})
```

### 4. Testes de Componentes - Frontend

```typescript
// ✅ BOM - Teste de componente Vue
// components/TradeModal.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TradeModal from './TradeModal.vue'
import * as api from '@/lib/api'

vi.mock('@/lib/api')

describe('TradeModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should render trade modal', () => {
    const wrapper = mount(TradeModal, {
      props: {
        symbol: 'BTC',
        isOpen: true,
        onClose: mockOnClose,
        onSuccess: mockOnSuccess
      }
    })
    
    expect(wrapper.text()).toContain('Trade BTC')
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Buy')
    expect(wrapper.text()).toContain('Sell')
  })
  
  it('should execute buy trade successfully', async () => {
    const mockExecuteTrade = vi.spyOn(api, 'executeTrade')
      .mockResolvedValue({ id: 'trade123', symbol: 'BTC' })
    
    const wrapper = mount(TradeModal, {
      props: {
        symbol: 'BTC',
        isOpen: true,
        onClose: mockOnClose,
        onSuccess: mockOnSuccess
      }
    })
    
    // Preenche amount
    const amountInput = wrapper.find('input[type="number"]')
    await amountInput.setValue(0.5)
    
    // Clica em Buy
    const buyButton = wrapper.find('button:contains("Buy")')
    await buyButton.trigger('click')
    
    // Aguarda execução
    await wrapper.vm.$nextTick()
    
    expect(mockExecuteTrade).toHaveBeenCalledWith({
      symbol: 'BTC',
      amount: 0.5,
      type: 'BUY'
    })
    expect(mockOnSuccess).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })
  
  it('should show error on invalid amount', async () => {
    const wrapper = mount(TradeModal, {
      props: {
        symbol: 'BTC',
        isOpen: true,
        onClose: mockOnClose,
        onSuccess: mockOnSuccess
      }
    })
    
    // Preenche amount inválido
    const amountInput = wrapper.find('input[type="number"]')
    await amountInput.setValue(-1)
    
    const buyButton = wrapper.find('button:contains("Buy")')
    await buyButton.trigger('click')
    
    // Verifica mensagem de erro
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Amount must be positive')
  })
})
```

### 5. Testes de Composables

```typescript
// ✅ BOM - Teste de composable Vue
// composables/useAuth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from './useAuth'
import * as api from '@/lib/api'

vi.mock('@/lib/api')

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should initialize with loading state', () => {
    const { user, loading } = useAuth()
    
    expect(user.value).toBeNull()
    expect(loading.value).toBe(true)
  })
  
  it('should login successfully', async () => {
    const mockLogin = vi.spyOn(api, '$fetch')
      .mockResolvedValue({ id: 'user123', username: 'testuser' })
    
    const { user, loading, login } = useAuth()
    
    await login('test@example.com', 'password')
    
    expect(user.value).toEqual({
      id: 'user123',
      username: 'testuser'
    })
    expect(loading.value).toBe(false)
  })
  
  it('should handle login error', async () => {
    const mockLogin = vi.spyOn(api, '$fetch')
      .mockRejectedValue(new Error('Invalid credentials'))
    
    const { user, login } = useAuth()
    
    await expect(
      login('test@example.com', 'wrong')
    ).rejects.toThrow('Invalid credentials')
    
    expect(user.value).toBeNull()
  })
})
```

### 6. Coverage Goals

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/**/*.test.{ts,vue}',
        'src/**/*.d.ts',
        'src/types/**'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  }
})
```
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

**Metas de Coverage:**
- **Services/Business Logic:** 80-90%
- **API Routes:** 70-80%
- **Componentes:** 60-70%
- **Utilities:** 80-90%

---

## 🚨 Error Handling

### 1. Hierarquia de Erros Customizados

```typescript
// ✅ BOM - Erros tipados e específicos
// errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details
    }
  }
}

// Erros específicos
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
  }
}

export class InsufficientBalanceError extends AppError {
  constructor() {
    super('Insufficient balance', 400, 'INSUFFICIENT_BALANCE')
  }
}
```

### 2. Global Error Handler

```typescript
// ✅ BOM - Centralized error handling
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { AppError } from './errors/AppError'
import { logger } from './utils/logger'

export function errorHandler(
  error: FastifyError | AppError | ZodError | Error,
  req: FastifyRequest,
  reply: FastifyReply
) {
  // Zod validation errors
  if (error instanceof ZodError) {
    return reply.code(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }
    })
  }
  
  // Custom app errors
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    })
  }
  
  // Mongoose errors
  if (error.name === 'MongoServerError') {
    if (error.code === 11000) {
      return reply.code(409).send({
        success: false,
        error: {
          code: 'DUPLICATE_KEY',
          message: 'Resource already exists'
        }
      })
    }
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return reply.code(401).send({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token'
      }
    })
  }
  
  if (error.name === 'TokenExpiredError') {
    return reply.code(401).send({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token expired'
      }
    })
  }
  
  // Log unexpected errors
  logger.error({
    err: error,
    req: {
      method: req.method,
      url: req.url,
      userId: req.user?.id
    }
  }, 'Unhandled error')
  
  // Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error)
  }
  
  // Generic error response (não expor detalhes em produção)
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : error.message
  
  return reply.code(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message
    }
  })
}
```

### 3. Try-Catch vs Error Propagation

```typescript
// ❌ RUIM - Try-catch em todo lugar
async function getUser(id: string) {
  try {
    return await User.findById(id)
  } catch (error) {
    console.log(error)
    throw error // Apenas repassa o erro
  }
}

// ✅ BOM - Deixa o erro propagar
async function getUser(id: string) {
  return User.findById(id)
  // Error handler global captura erros
}

// ✅ BOM - Try-catch apenas quando precisa lidar com o erro
async function getUserWithDefault(id: string) {
  try {
    return await User.findById(id)
  } catch (error) {
    logger.warn({ userId: id }, 'User not found, returning default')
    return createDefaultUser()
  }
}
```

### 4. Error Handling no Frontend

```typescript
// ✅ BOM - Composable para handling de erros
// composables/useApiError.ts
export const useApiError = () => {
  const error = ref<string | null>(null)
  const toast = useToast()
  
  const handleError = (err: any) => {
    const message = err.response?.data?.error?.message || err.message || 'An error occurred'
    
    error.value = message
    toast.add({
      title: 'Error',
      description: message,
      color: 'red'
    })
    
    // Loga no console em dev
    if (process.dev) {
      console.error(err)
    }
    
    // Sentry
    if (import.meta.env.PROD) {
      // Enviar para Sentry
    }
  }
  
  const clearError = () => {
    error.value = null
  }
  
  return { error, handleError, clearError }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <UAlert v-if="error" color="red" :title="error" />
    <!-- ... -->
  </form>
</template>

<script setup lang="ts">
// Uso
const { error, handleError, clearError } = useApiError()

const handleSubmit = async (data: TradeData) => {
  try {
    clearError()
    await $fetch('/api/trades', {
      method: 'POST',
      body: data
    })
    
    useToast().add({
      title: 'Success',
      description: 'Trade executed successfully',
      color: 'green'
    })
  } catch (err) {
    handleError(err)
  }
}
</script>
```

---

## 📊 Logging

### 1. Structured Logging com Pino

```typescript
// ✅ BOM - Logger configurado
// utils/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      hostname: bindings.hostname,
      node_version: process.version
    })
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Pretty print em desenvolvimento
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname'
    }
  } : undefined
})

// Child logger para contexto específico
export function createLogger(context: string) {
  return logger.child({ context })
}
```

### 2. Logging Best Practices

```typescript
// ✅ BOM - Logging estruturado
const tradeLogger = createLogger('trade')

// Info com contexto
tradeLogger.info({ 
  userId, 
  symbol: 'BTC', 
  amount: 0.5 
}, 'Trade executed')

// Warning com contexto
tradeLogger.warn({ 
  userId, 
  attempts: 5 
}, 'Multiple failed trade attempts')

// Error com stack trace
tradeLogger.error({ 
  err: error,
  userId,
  symbol: 'BTC'
}, 'Trade execution failed')

// ❌ NUNCA logue dados sensíveis
logger.info({ password: 'secret123' }, 'Login') // ❌
logger.info({ creditCard: '1234-5678' }, 'Payment') // ❌
logger.info({ apiKey: 'sk_live_...' }, 'API call') // ❌

// ✅ BOM - Sanitize antes de logar
logger.info({ 
  userId,
  email: sanitizeEmail(user.email)
}, 'User registered')
```

### 3. Request Logging Middleware

```typescript
// ✅ BOM - Log de todas requests
import { FastifyRequest, FastifyReply } from 'fastify'

app.addHook('onRequest', (req, reply, done) => {
  logger.info({
    req: {
      id: req.id,
      method: req.method,
      url: req.url,
      userId: req.user?.id
    }
  }, 'Incoming request')
  done()
})

app.addHook('onResponse', (req, reply, done) => {
  logger.info({
    req: {
      id: req.id,
      method: req.method,
      url: req.url
    },
    res: {
      statusCode: reply.statusCode
    },
    responseTime: reply.getResponseTime()
  }, 'Request completed')
  done()
})
```

### 4. Log Levels

```typescript
// ✅ BOM - Usar níveis apropriados
logger.trace({ detail: '...' }, 'Very detailed info') // Desenvolvimento
logger.debug({ state: {...} }, 'Debug info')          // Desenvolvimento
logger.info({ userId }, 'Normal operation')           // Produção
logger.warn({ count: 10 }, 'Warning condition')       // Produção
logger.error({ err }, 'Error occurred')               // Produção
logger.fatal({ err }, 'Critical error')               // Produção (crash)

// Em produção: level = 'info'
// Em desenvolvimento: level = 'debug' ou 'trace'
```

---

## 🔄 Git Workflow

### 1. Branching Strategy - Git Flow Simplificado

```
main           (produção - sempre estável)
  ↑
develop        (development - integração)
  ↑
feature/xxx    (features)
bugfix/xxx     (correções)
hotfix/xxx     (correções urgentes em produção)
```

### 2. Commit Messages - Conventional Commits

```bash
# ✅ BOM - Mensagens padronizadas
git commit -m "feat: add XP calculation for trades"
git commit -m "fix: prevent negative balance in trades"
git commit -m "refactor: extract trade logic to service"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for TradeService"
git commit -m "chore: update dependencies"
git commit -m "style: format code with prettier"
git commit -m "perf: optimize leaderboard query"

# Tipos:
# feat:     Nova feature
# fix:      Bug fix
# refactor: Refatoração de código
# docs:     Documentação
# test:     Testes
# chore:    Tarefas de manutenção
# style:    Formatação de código
# perf:     Performance improvement

# ❌ RUIM - Mensagens vagas
git commit -m "fix"
git commit -m "update"
git commit -m "changes"
git commit -m "asdfjkl"
```

### 3. Pull Request Template

``````markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
``````

### 4. Code Review Checklist

```markdown
## Reviewer Checklist

### Code Quality
- [ ] Code is readable and well-structured
- [ ] No code duplication (DRY)
- [ ] SOLID principles followed
- [ ] Error handling is appropriate
- [ ] No hardcoded values

### Security
- [ ] No sensitive data exposed
- [ ] Input validation present
- [ ] Authentication/authorization correct
- [ ] No SQL/NoSQL injection risks

### Performance
- [ ] No N+1 queries
- [ ] Appropriate indexes used
- [ ] Caching implemented where needed
- [ ] No unnecessary computations

### Testing
- [ ] Tests cover new code
- [ ] Tests are meaningful
- [ ] Edge cases tested

### Documentation
- [ ] Code comments where needed
- [ ] API docs updated
- [ ] README updated if needed
```

---

## ❌ O Que NÃO Fazer

### 1. Anti-Patterns Comuns

```typescript
// ❌ God Object - classe que faz tudo
class GodService {
  handleUser() {}
  handleTrade() {}
  handleCrypto() {}
  handleLeaderboard() {}
  handleNotification() {}
  sendEmail() {}
  processPayment() {}
  // 1000 linhas depois...
}

// ❌ Magic Numbers
if (user.level > 5) {} // O que significa 5?
setTimeout(callback, 86400000) // Quantos dias?

// ✅ BOM - Constantes nomeadas
const MAX_FREE_LEVEL = 5
const ONE_DAY_MS = 24 * 60 * 60 * 1000

// ❌ Callback Hell
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      // ...
    })
  })
})

// ✅ BOM - Async/await
const a = await getData()
const b = await getMoreData(a)
const c = await getMoreData(b)

// ❌ Ignorar erros
try {
  await riskyOperation()
} catch (error) {
  // Silêncio...
}

// ✅ BOM - Sempre lidar com erros
try {
  await riskyOperation()
} catch (error) {
  logger.error({ err: error }, 'Risky operation failed')
  throw error // ou handle apropriadamente
}
```

### 2. Segurança - NUNCA Fazer

```typescript
// ❌ NUNCA commitar secrets
const apiKey = 'sk_live_abc123'
const dbPassword = 'mypassword123'

// ❌ NUNCA usar eval
eval(userInput)

// ❌ NUNCA confiar no input do usuário
const userId = req.body.userId // Pode ser manipulado!
const user = await User.findById(userId)

// ✅ BOM - Sempre pegar do token autenticado
const userId = req.user.id
const user = await User.findById(userId)

// ❌ NUNCA expor stack traces em produção
catch (error) {
  res.send({ error: error.stack }) // ❌
}

// ❌ NUNCA usar SELECT *
SELECT * FROM users // ❌

// ✅ BOM - Selecionar apenas campos necessários
SELECT id, username, email FROM users
```

### 3. Performance - NUNCA Fazer

```typescript
// ❌ N+1 Queries
const users = await User.find()
for (const user of users) {
  user.trades = await Trade.find({ userId: user.id }) // ❌
}

// ❌ Query dentro de loop
for (let i = 0; i < 1000; i++) {
  await User.findByIdAndUpdate(ids[i], { xp: i }) // ❌
}

// ❌ Bloquear event loop
function slowSync() {
  for (let i = 0; i < 1000000000; i++) {} // ❌ Bloqueia tudo
}

// ❌ Não usar indexes
// Schema sem indexes = queries lentas
```

### 4. Código - NUNCA Fazer

```typescript
// ❌ Variáveis com nomes ruins
const x = getData()
const temp = user.data
const thing = process()

// ❌ Funções gigantes
function doEverything() {
  // 500 linhas de código
}

// ❌ Comentários óbvios
// Incrementa i
i++

// ❌ Código comentado (use git!)
// const oldCode = () => {}
// function deprecated() {}

// ❌ Console.log em produção
console.log('Debug:', user) // ❌ Use logger

// ❌ Usar var
var name = 'Gobs' // ❌ Use const/let

// ❌ Comparação com ==
if (x == '5') {} // ❌ Use ===

// ❌ Modificar parâmetros
function changeUser(user) {
  user.name = 'Changed' // ❌ Side effect
}
```

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Vue 3 Documentation](https://vuejs.org/)
- [Nuxt 4 Documentation](https://nuxt.com/)
- [Fastify Documentation](https://fastify.dev/)

### Livros Recomendados
- Clean Code - Robert C. Martin
- Clean Architecture - Robert C. Martin
- Refactoring - Martin Fowler
- Design Patterns - Gang of Four

### Tools
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Husky](https://typicode.github.io/husky/) - Git hooks
- [Commitlint](https://commitlint.js.org/) - Commit message linting

---

## 🎯 Conclusão

Este guia é um **documento vivo** e deve ser atualizado conforme o projeto evolui. O objetivo é manter um padrão de código consistente, seguro e performático.

**Princípios Fundamentais:**
1. **Código limpo** é mais importante que código "inteligente"
2. **Segurança** nunca é opcional
3. **Performance** deve ser medida, não assumida
4. **Testes** não são overhead, são investimento
5. **Documentação** é parte do código

**Lembre-se:**
- O código é lido muito mais vezes do que escrito
- Um bug em produção custa 100x mais que em desenvolvimento
- Otimização prematura é a raiz de todo mal
- Se funciona, mas é difícil entender, não funciona

**Revisão contínua é essencial.** Sempre que identificar um padrão novo ou uma melhoria, atualize este documento.

---

**Última atualização:** Novembro 2025  
**Versão:** 1.0.0
