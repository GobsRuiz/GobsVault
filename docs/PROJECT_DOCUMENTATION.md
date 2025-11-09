# 📊 GobsVault - Documentação do Projeto

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Objetivos](#objetivos)
3. [Funcionalidades](#funcionalidades)
4. [Stack Tecnológica](#stack-tecnológica)
5. [Arquitetura do Sistema](#arquitetura-do-sistema)
6. [Estrutura de Diretórios](#estrutura-de-diretórios)
7. [Fluxo de Dados](#fluxo-de-dados)
8. [Sistema de Gamificação](#sistema-de-gamificação)
9. [Cache e Performance](#cache-e-performance)
10. [Segurança](#segurança)
11. [Hospedagem](#hospedagem)
12. [Roadmap Futuro](#roadmap-futuro)

---

## 🎯 Visão Geral

**GobsVault** é uma plataforma web de trading simulado de criptomoedas com elementos de gamificação. O projeto combina um sistema de jogo competitivo com dados reais do mercado cripto, permitindo que usuários comprem e vendam criptomoedas usando dinheiro virtual.

### Propósito do Projeto

Este é um **projeto pessoal de portfólio** desenvolvido para demonstrar habilidades técnicas avançadas em desenvolvimento full-stack, incluindo:
- Arquitetura de aplicações em tempo real
- Gamificação e design de sistemas
- Performance e otimização
- Segurança web (OWASP)
- Práticas modernas de desenvolvimento

---

## 🎯 Objetivos

### Objetivos Técnicos
- Implementar arquitetura real-time com WebSockets
- Aplicar padrões de cache multi-camada
- Demonstrar conhecimento em segurança web
- Utilizar TypeScript e validação de schemas compartilhados
- Implementar testes automatizados
- Criar código limpo e bem documentado

### Objetivos do Jogo
- Simular experiência de trading de criptomoedas
- Aumentar capital virtual através de trades estratégicos
- Progredir através de sistema de XP e níveis
- Competir globalmente e com amigos
- Completar quests e desafios para recompensas

---

## ⚡ Funcionalidades

### 🔐 Autenticação e Perfil
- Registro e login de usuários
- Perfil personalizado com estatísticas
- Histórico completo de trades
- Dashboard de performance (ROI, win rate, melhor/pior trade)
- Gráfico de evolução patrimonial ao longo do tempo

### 💰 Sistema de Trading
- **Saldo inicial:** 10.000 (dinheiro virtual)
- **Compra/Venda:** Interface simples e intuitiva
  - Seleciona cripto
  - Informa quantidade
  - Visualiza valor total em tempo real
  - Confirma operação
- **Carteira (Portfolio):**
  - Visualização de todas criptos possuídas
  - Valores atualizados em tempo real
  - Distribuição de ativos (gráfico de pizza)
  - Saldo total atualizado constantemente
- **Histórico de trades:** Todas operações registradas

### 📊 Dashboard e Gráficos
- **Lista de criptomoedas** com preços em tempo real
- **Gráficos integrados:**
  - **nuxt-charts:** Biblioteca completa de gráficos (wrapper do Chart.js)
  - Tipos disponíveis: Line, Bar, Pie, Doughnut, Candlestick
  - Responsivos e customizáveis
- **Métricas de performance:** Comparativo com médias globais

### 🎮 Sistema de Gamificação

#### XP (Experience Points)
- Ganho de XP por:
  - Cada trade realizado (compra ou venda)
  - Completar quests/desafios
  - Combo system (trades bem-sucedidos consecutivos)
- **Multiplicador de XP:** Aumenta conforme o nível sobe

#### Níveis e Ranks
- Sistema progressivo de níveis
- Ranks baseados em XP:
  - Iniciante
  - Bronze
  - Prata
  - Ouro
  - Diamante

#### Badges (Conquistas)
- **Milestone badges:** "Primeiro Trade", "10 Trades", "100 Trades"
- **Achievement badges:** "Lucro de 50%", "Portfolio 5+ moedas"
- **Streak badges:** "7 dias ativos", "30 dias consecutivos"
- **Performance badges:** "Melhor trade do dia", "Top 10 global"

#### Títulos Especiais
- Desbloqueados por conquistas específicas
- Exemplos: "Whale", "Day Trader", "HODL Master"

### 🎯 Quests e Desafios
- **Daily Quests:** Tarefas diárias (ex: "Faça 5 trades hoje")
- **Weekly Quests:** Desafios semanais (ex: "Lucre 5% esta semana")
- **Recompensas:** XP + possíveis bônus de saldo

### 🏆 Sistema Social e Ranking

#### Leaderboard (Ranking)
- **Global:** Ranking de todos os jogadores
- **Amigos:** Ranking apenas entre amigos adicionados
- Ordenação por:
  - Patrimônio total
  - XP
  - Nível

#### Sistema de Amigos
- Adicionar/remover amigos
- Visualizar portfólio de amigos
- Comparar performance
- **Sem chat** (foco em competição e análise)

### 🔔 Sistema de Notificações
- **Em tempo real via WebSocket:**
  - "Você subiu de nível!"
  - "Nova badge desbloqueada!"
  - "Amigo te ultrapassou no ranking"
  - "Quest completada"
  - Alertas de XP ganho

### 🔒 Segurança
- Rate limiting (previne spam de trades)
- Audit log (registro de todas ações críticas)
- Validação rigorosa de inputs (cliente + servidor)
- Proteção contra ataques comuns (XSS, CSRF, Injection)

---

## 🛠️ Stack Tecnológica

### Frontend
```
- Framework: Nuxt 4 (Vue 3)
- Modo: SPA (Single Page Application)
- Linguagem: TypeScript
- UI Framework: Nuxt UI (componentes pré-construídos)
- Gráficos: nuxt-charts (wrapper para Chart.js)
- Validação: Zod (shared)
- State Management: Pinia (oficial Nuxt)
- Styling: Tailwind CSS (integrado Nuxt UI)
- Real-time: Socket.IO Client
```

### Backend
```
- Runtime: Node.js
- Framework: Fastify
- Linguagem: TypeScript
- Banco de Dados: MongoDB + Mongoose
- Cache: Redis
- Real-time: Socket.IO
- Validação: Zod (shared)
- Autenticação: JWT (HttpOnly Cookies)
- Hash: Bcrypt (12 rounds)
- Segurança: Helmet, CORS, express-mongo-sanitize
```

### Infraestrutura
```
- Frontend: Vercel (gratuito)
- Backend: Render / Railway (gratuito com limitações)
- Database: MongoDB Atlas M0 (gratuito - 512MB)
- Cache: Redis Cloud (gratuito - 30MB)
- CDN: Cloudflare (gratuito)
- API Externa: CoinGecko API (gratuito - 10-30 calls/min)
  - Criptomoedas Disponíveis (Fase Inicial):
    - Bitcoin (BTC)
    - Ethereum (ETH)
    - Tether (USDT)
  - Mais criptomoedas serão adicionadas em fases futuras
```

### Ferramentas de Desenvolvimento
```
- Testes: 
  - Backend: Jest + Supertest
  - Frontend: Vitest + Testing Library
- Linting: ESLint + Prettier
- Monorepo: pnpm workspaces
- Logging: Pino (backend)
- Monitoramento: Sentry (erros), UptimeRobot (uptime)
- Documentação: JSDoc / TSDoc
```

---

## 🏗️ Arquitetura do Sistema

### Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                     │
│   Nuxt 4 SPA + Vue 3 + TypeScript + Socket.IO Client   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ REST API (HTTPS)
                    │ WebSocket (WSS)
                    │
┌───────────────────▼─────────────────────────────────────┐
│                 BACKEND (Render/Railway)                 │
│         Fastify + TypeScript + Socket.IO Server         │
│           Clean Architecture (4 Camadas)                 │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   API       │  │  WebSocket  │  │   Auth      │    │
│  │  Routes     │  │   Handler   │  │  Middleware │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Services   │  │   Cache     │  │   Logger    │    │
│  │   Layer     │  │   Layer     │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└───────┬──────────────────┬──────────────────┬──────────┘
        │                  │                  │
        │                  │                  │
┌───────▼────────┐ ┌──────▼───────┐ ┌────────▼──────────┐
│   MongoDB      │ │    Redis     │ │  CoinGecko API    │
│  (Atlas M0)    │ │ (Redis Cloud)│ │   (External)      │
└────────────────┘ └──────────────┘ └───────────────────┘
```

### Fluxo de Comunicação

#### REST API (Operações CRUD)
- Login/Registro
- Obter perfil
- Realizar trade
- Buscar histórico
- Gerenciar amigos
- Completar quests

#### WebSocket (Real-Time)
- Atualização de preços de criptos (broadcast)
- Notificações (por usuário)
- Atualizações de ranking
- Status de amigos online

---

## 📁 Estrutura de Diretórios

### Monorepo Structure

```
gobsvault/
├── frontend/                    # Nuxt 4 Application
│   ├── pages/                  # Pages (auto-routing)
│   │   ├── index.vue
│   │   ├── dashboard.vue
│   │   ├── profile.vue
│   │   ├── leaderboard.vue
│   │   └── auth/
│   │       ├── login.vue
│   │       └── register.vue
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.vue
│   │   │   ├── Card.vue
│   │   │   └── Modal.vue
│   │   ├── trading/
│   │   │   ├── CryptoList.vue
│   │   │   ├── TradeModal.vue
│   │   │   └── Portfolio.vue
│   │   ├── charts/
│   │   │   ├── LineChart.vue
│   │   │   ├── PieChart.vue
│   │   │   └── CandlestickChart.vue
│   │   ├── gamification/
│   │   │   ├── XPBar.vue
│   │   │   ├── BadgeList.vue
│   │   │   └── QuestCard.vue
│   │   └── layout/
│   │       ├── Header.vue
│   │       ├── Sidebar.vue
│   │       └── Notification.vue
│   ├── composables/            # Composables (reusable logic)
│   │   ├── useAuth.ts
│   │   ├── useCrypto.ts
│   │   ├── useWebSocket.ts
│   │   └── useNotification.ts
│   ├── stores/                 # Pinia stores
│   │   ├── auth.ts
│   │   ├── crypto.ts
│   │   ├── portfolio.ts
│   │   └── notification.ts
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   ├── socket.ts           # Socket.IO client
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── assets/
│   │   ├── css/
│   │   └── images/
│   ├── public/
│   │   └── favicon.ico
│   ├── tests/
│   │   ├── components/
│   │   └── composables/
│   ├── nuxt.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                     # Fastify Application
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   ├── trade.routes.ts
│   │   │   │   ├── crypto.routes.ts
│   │   │   │   ├── leaderboard.routes.ts
│   │   │   │   ├── friend.routes.ts
│   │   │   │   └── quest.routes.ts
│   │   │   └── middlewares/
│   │   │       ├── auth.middleware.ts
│   │   │       ├── rateLimit.middleware.ts
│   │   │       └── validation.middleware.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── trade.service.ts
│   │   │   ├── crypto.service.ts
│   │   │   ├── gamification.service.ts
│   │   │   ├── leaderboard.service.ts
│   │   │   ├── quest.service.ts
│   │   │   └── notification.service.ts
│   │   ├── models/
│   │   │   ├── User.model.ts
│   │   │   ├── Trade.model.ts
│   │   │   ├── Portfolio.model.ts
│   │   │   ├── Quest.model.ts
│   │   │   ├── Badge.model.ts
│   │   │   └── AuditLog.model.ts
│   │   ├── cache/
│   │   │   ├── redis.client.ts
│   │   │   └── cache.service.ts
│   │   ├── websocket/
│   │   │   ├── socket.handler.ts
│   │   │   └── events/
│   │   │       ├── price.events.ts
│   │   │       └── notification.events.ts
│   │   ├── utils/
│   │   │   ├── jwt.util.ts
│   │   │   ├── bcrypt.util.ts
│   │   │   └── logger.util.ts
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── redis.config.ts
│   │   │   └── app.config.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   └── server.ts           # Entry point
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                      # Shared Code (Zod Schemas)
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── user.schema.ts
│   │   ├── trade.schema.ts
│   │   ├── crypto.schema.ts
│   │   └── quest.schema.ts
│   ├── types/
│   │   └── index.ts
│   ├── constants/
│   │   └── index.ts
│   ├── tsconfig.json
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── frontend-deploy.yml
│       └── backend-deploy.yml
├── .gitignore
├── pnpm-workspace.yaml
├── README.md
├── PROJECT_DOCUMENTATION.md
└── DEVELOPMENT_GUIDELINES.md
```

---

## 🔄 Fluxo de Dados

### 1. Autenticação

```
Usuario → [Login] → Backend
                     ↓
                  Valida credenciais (Zod + Bcrypt)
                     ↓
                  Gera JWT (Access + Refresh)
                     ↓
                  HttpOnly Cookies → Frontend
                     ↓
                  Usuario autenticado
```

### 2. Realizar Trade (Compra)

```
Usuario → Seleciona cripto + quantidade → Frontend
                                           ↓
                                     Valida input (Zod)
                                           ↓
                                     POST /api/trades
                                           ↓
Backend ← Verifica autenticação (JWT)
         ↓
      Valida dados (Zod shared)
         ↓
      Verifica saldo suficiente
         ↓
      Busca preço atual (Redis cache ou CoinGecko)
         ↓
      Cria trade no MongoDB
         ↓
      Atualiza portfolio
         ↓
      Calcula e adiciona XP
         ↓
      Verifica quests completadas
         ↓
      Verifica novas badges
         ↓
      Atualiza leaderboard (Redis)
         ↓
      Envia notificação via WebSocket
         ↓
Frontend ← Atualiza UI em tempo real
```

### 3. Atualização de Preços (Real-Time)

```
Backend (Job Scheduler - a cada 10s)
   ↓
Busca preços CoinGecko API
   ↓
Armazena no Redis (TTL: 1min)
   ↓
Broadcast via Socket.IO para todos conectados
   ↓
Frontend recebe via WebSocket
   ↓
Atualiza preços na tela
   ↓
Recalcula valores do portfolio em tempo real
```

---

## 🎮 Sistema de Gamificação

### Cálculo de XP

```typescript
// XP base por trade
const BASE_XP = 10

// Multiplicador de nível
const levelMultiplier = 1 + (userLevel * 0.1)

// Combo bonus (trades consecutivos bem-sucedidos)
const comboBonus = comboStreak > 0 ? comboStreak * 5 : 0

// XP final
const totalXP = (BASE_XP * levelMultiplier) + comboBonus
```

**Definição de Trade Bem-Sucedido (para combo):**
- Trade de **VENDA** que resulta em lucro em relação ao preço médio de compra daquela cripto
- Exemplo: Comprou BTC a $40k, vendeu a $45k = trade bem-sucedido ✅
- Exemplo: Comprou BTC a $40k, vendeu a $38k = trade mal-sucedido (quebra combo) ❌
- Trades de **COMPRA** não afetam o combo (nem aumentam nem quebram)
- Combo reseta a zero em trade de venda com prejuízo

#### Sistema de Níveis

```typescript
// XP necessário para próximo nível (crescimento exponencial)
const xpForNextLevel = baseXP * Math.pow(levelFactor, currentLevel)

// Exemplo:
// Nível 1 → 2: 100 XP
// Nível 2 → 3: 150 XP
// Nível 3 → 4: 225 XP
// ...
```

### Ranks e Requisitos de XP

| Rank | Nível Mínimo | XP Total Necessário | Descrição |
|------|--------------|---------------------|-----------|
| **Iniciante** | 1-5 | 0 - 500 | Começando a jornada |
| **Bronze** | 6-10 | 500 - 1.500 | Trader em desenvolvimento |
| **Prata** | 11-20 | 1.500 - 5.000 | Trader experiente |
| **Ouro** | 21-35 | 5.000 - 15.000 | Trader avançado |
| **Diamante** | 36+ | 15.000+ | Elite do trading |

### Tipos de Badges

| Tipo | Descrição | Exemplos |
|------|-----------|----------|
| **Milestone** | Baseado em quantidades | "10 Trades", "100 Trades", "1000 Trades" |
| **Achievement** | Baseado em conquistas | "Lucro 50%", "5 Criptos", "ROI Positivo 30 dias" |
| **Streak** | Baseado em consistência | "7 dias seguidos", "30 dias seguidos" |
| **Performance** | Baseado em ranking | "Top 10 Global", "Top 3 Amigos" |
| **Special** | Títulos únicos | "Whale" (patrimônio > 1M), "HODL Master" (segura >90 dias) |

### Quests Diárias/Semanais

#### Daily Quests (Exemplo)
```json
{
  "id": "daily_5_trades",
  "title": "Trader Ativo",
  "description": "Faça 5 trades hoje",
  "type": "daily",
  "requirement": {
    "action": "trade",
    "count": 5
  },
  "reward": {
    "xp": 50,
    "bonus": null
  },
  "expires_at": "2025-11-07T23:59:59Z"
}
```

#### Weekly Quests (Exemplo)
```json
{
  "id": "weekly_profit_5pct",
  "title": "Investidor Perspicaz",
  "description": "Lucre 5% esta semana",
  "type": "weekly",
  "requirement": {
    "action": "profit_percentage",
    "value": 5
  },
  "reward": {
    "xp": 200,
    "bonus": 1000
  },
  "expires_at": "2025-11-10T23:59:59Z"
}
```

---

## ⚡ Cache e Performance

### Estratégia de Cache Multi-Camada

#### 1. Redis (Backend Cache)

```typescript
// Preços de criptomoedas (CoinGecko)
Key: "crypto:prices"
TTL: 60 segundos
Value: { BTC: 45000, ETH: 3000, ... }

// Ranking global
Key: "leaderboard:global"
TTL: 5 minutos
Value: [{ userId, username, netWorth, xp }, ...]

// Rate limiting
Key: "ratelimit:{userId}:{endpoint}"
TTL: 60 segundos
Value: counter

// User sessions (backup)
Key: "session:{userId}"
TTL: 15 minutos
Value: { userData }
```

#### 2. localStorage (Frontend)

```javascript
// Tema e preferências
localStorage.setItem('theme', 'dark')
localStorage.setItem('language', 'pt-BR')
localStorage.setItem('chartPreference', 'candlestick')

// Última cripto visualizada (UX)
localStorage.setItem('lastCrypto', 'BTC')
```

#### 3. HTTP Cookies (Autenticação)

```javascript
// Access Token
Name: accessToken
HttpOnly: true
Secure: true
SameSite: strict
MaxAge: 900000 (15min)

// Refresh Token
Name: refreshToken
HttpOnly: true
Secure: true
SameSite: strict
MaxAge: 604800000 (7 dias)
```

### Otimizações de Performance

#### Backend
- **MongoDB Indexes:** userId, email, createdAt, xp (para rankings)
- **Connection Pooling:** Reutilização de conexões MongoDB
- **Compression:** gzip/brotli para responses
- **Pagination:** Históricos e rankings paginados (limit: 50 por página)
- **Batch Operations:** insertMany ao invés de múltiplos saves

#### Frontend
- **Code Splitting:** Automático pelo Nuxt 4
- **Image Optimization:** Nuxt Image component (@nuxt/image)
- **Lazy Loading:** Gráficos TradingView só renderizam quando visíveis
- **Debounce:** Inputs de busca (300ms delay)
- **useMemo/useCallback:** Memoização de cálculos pesados
- **Virtual Scrolling:** vue-virtual-scroller para listas > 1000 itens

#### WebSocket
- **Throttling:** Updates a cada 2 segundos (não a cada tick)
- **Compression:** Socket.IO compression ativo
- **Room Segmentation:** Usuários em rooms específicas (reduz broadcasts desnecessários)

---

## 🔒 Segurança

### OWASP Top 10 - Implementações

#### 1. Broken Access Control
```typescript
// Middleware de autenticação
async function authMiddleware(req, reply) {
  const token = req.cookies.accessToken
  if (!token) return reply.code(401).send({ error: 'Unauthorized' })
  
  const payload = verifyJWT(token)
  req.user = payload // Sempre verifica userId no backend
}

// Exemplo: Usuário só acessa seus próprios trades
async function getUserTrades(req, reply) {
  const trades = await Trade.find({ userId: req.user.id }) // NUNCA confia no body
}
```

#### 2. Cryptographic Failures
```typescript
// Senha nunca exposta
const userSchema = new Schema({
  password: { type: String, required: true, select: false }
})

// Bcrypt com 12 rounds
const hashedPassword = await bcrypt.hash(password, 12)

// JWT com secret forte (em .env)
const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' })
```

#### 3. Injection Prevention
```typescript
// Zod validation em TODAS rotas
import { tradeSchema } from '@gobsvault/shared/schemas'

app.post('/api/trades', async (req, reply) => {
  const validated = tradeSchema.parse(req.body) // Lança erro se inválido
  // ...
})

// Sanitização MongoDB
import mongoSanitize from 'express-mongo-sanitize'
app.use(mongoSanitize())
```

#### 4. Rate Limiting
```typescript
// Global rate limit (todos endpoints)
app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute'
})

// ============================================
// Rate Limits Específicos por Endpoint
// ============================================

// Autenticação - Login (previne brute force)
app.post('/api/auth/login', {
  config: {
    rateLimit: {
      max: 5,
      timeWindow: '15 minutes'
    }
  }
}, loginHandler)

// Autenticação - Registro
app.post('/api/auth/register', {
  config: {
    rateLimit: {
      max: 3,
      timeWindow: '1 hour'
    }
  }
}, registerHandler)

// Trades - Criar trade (previne spam de trades)
app.post('/api/trades', {
  config: {
    rateLimit: {
      max: 10,
      timeWindow: '1 minute'
    }
  }
}, tradeHandler)

// Leaderboard - Consulta
app.get('/api/leaderboard', {
  config: {
    rateLimit: {
      max: 20,
      timeWindow: '1 minute'
    }
  }
}, leaderboardHandler)

// Preços - Consulta de preços (cache deve ser usado)
app.get('/api/crypto/prices', {
  config: {
    rateLimit: {
      max: 30,
      timeWindow: '1 minute'
    }
  }
}, pricesHandler)

// Amigos - Adicionar amigo
app.post('/api/friends', {
  config: {
    rateLimit: {
      max: 10,
      timeWindow: '5 minutes'
    }
  }
}, addFriendHandler)

// Perfil - Atualizar perfil
app.put('/api/user/profile', {
  config: {
    rateLimit: {
      max: 5,
      timeWindow: '5 minutes'
    }
  }
}, updateProfileHandler)

// Quests - Completar quest
app.post('/api/quests/:id/complete', {
  config: {
    rateLimit: {
      max: 20,
      timeWindow: '1 minute'
    }
  }
}, completeQuestHandler)
```

**Resumo dos Rate Limits:**
| Endpoint | Limite | Janela de Tempo | Motivo |
|----------|--------|-----------------|--------|
| **Global** | 100 req | 1 minuto | Proteção geral |
| `/auth/login` | 5 req | 15 minutos | Previne brute force |
| `/auth/register` | 3 req | 1 hora | Previne spam de contas |
| `/trades` | 10 req | 1 minuto | Previne spam de trades |
| `/leaderboard` | 20 req | 1 minuto | Reduz carga no banco |
| `/crypto/prices` | 30 req | 1 minuto | Força uso de cache |
| `/friends` | 10 req | 5 minutos | Previne spam de amigos |
| `/user/profile` | 5 req | 5 minutos | Reduz writes no banco |
| `/quests/:id/complete` | 20 req | 1 minuto | Previne exploits |

#### 5. Security Headers (Helmet.js)
```typescript
import helmet from '@fastify/helmet'

app.register(helmet, {
  contentSecurityPolicy: true,
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000 }
})
```

#### 6. CORS Restritivo
```typescript
import cors from '@fastify/cors'

app.register(cors, {
  origin: process.env.FRONTEND_URL, // NUNCA '*'
  credentials: true, // Permite cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE']
})
```

#### 7. Audit Logging
```typescript
// Log de todas ações críticas
await AuditLog.create({
  userId: req.user.id,
  action: 'TRADE_SELL',
  details: { crypto: 'BTC', amount: 0.5, price: 45000 },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  timestamp: new Date()
})
```

#### 8. JWT Token Management
```typescript
// Logout = blacklist token no Redis
async function logout(req, reply) {
  const token = req.cookies.accessToken
  const decoded = jwt.decode(token)
  
  // Adiciona token na blacklist até expirar
  await redis.setex(`blacklist:${token}`, decoded.exp - Date.now(), '1')
  
  reply.clearCookie('accessToken')
  reply.clearCookie('refreshToken')
}

// Verifica blacklist em toda request
async function verifyToken(token) {
  const isBlacklisted = await redis.get(`blacklist:${token}`)
  if (isBlacklisted) throw new Error('Token invalidated')
  
  return jwt.verify(token, process.env.JWT_SECRET)
}
```

### Variáveis de Ambiente

```bash
# .env.example

# App
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://gobsvault.vercel.app

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gobsvault

# Redis
REDIS_URL=redis://:password@host:port

# JWT
JWT_SECRET=seu-secret-ultra-forte-minimo-32-caracteres
JWT_REFRESH_SECRET=outro-secret-diferente-ultra-forte
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CoinGecko
COINGECKO_API_KEY= # Opcional (tier pago)

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Logging
LOG_LEVEL=info
SENTRY_DSN=https://...

# Cookie
COOKIE_DOMAIN=.gobsvault.com
COOKIE_SECURE=true
```

**⚠️ NUNCA commitar .env - usar apenas .env.example**

---

## 🌐 Hospedagem

### Infraestrutura Gratuita

#### Frontend - Vercel
- **Custo:** Gratuito (hobby tier)
- **Features:**
  - Deploy automático via Git
  - CDN global
  - SSL automático
  - Preview deployments
  - Analytics básico
- **URL:** `https://gobsvault.vercel.app`

**Configuração Nuxt 4 como SPA:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false, // SPA mode
  
  modules: [
    '@nuxt/ui',
    'nuxt-charts'
  ],
  
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:4000'
    }
  },
  
  app: {
    head: {
      title: 'GobsVault',
      meta: [
        { name: 'description', content: 'Trading de criptomoedas gamificado' }
      ]
    }
  }
})
```

#### Backend - Render.com
- **Custo:** Gratuito (750h/mês)
- **Features:**
  - Auto-deploy do GitHub
  - WebSocket suportado
  - SSL automático
- **Limitação:** Dorme após 15min de inatividade (acorda em ~30s)
- **Alternativa:** Railway ($5 crédito/mês grátis)

#### MongoDB - Atlas M0
- **Custo:** Gratuito
- **Storage:** 512MB
- **Specs:** Compartilhado, 100 conexões max
- **Backup:** Snapshot manual
- **Suficiente para:** Centenas de usuários

#### Redis - Redis Cloud
- **Custo:** Gratuito
- **Storage:** 30MB
- **Suficiente para:** ~10.000 usuários simultâneos
- **Alternativa:** Upstash (10k commands/dia)

#### CDN - Cloudflare
- **Custo:** Gratuito
- **Features:**
  - Cache de assets estáticos
  - DDoS protection
  - Analytics
  - SSL

### Deploy Pipeline

```yaml
# .github/workflows/backend-deploy.yml

name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - 'shared/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
      
      # Deploy automático para Render
      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST https://api.render.com/deploy/...
```

---

## 🗓️ Roadmap Futuro

### Fase 1 - MVP (Concluída)
- ✅ Autenticação e perfil
- ✅ Trading básico
- ✅ Sistema de XP e níveis
- ✅ Leaderboard global
- ✅ WebSocket real-time
- ✅ Gráficos básicos

### Fase 2 - Gamificação Avançada
- [ ] Sistema completo de badges (todas categorias)
- [ ] Quests diárias/semanais automatizadas
- [ ] Títulos especiais com requisitos complexos
- [ ] Eventos temporários (competições limitadas)
- [ ] Seasonal rankings (mensais/anuais)

### Fase 3 - Social
- [ ] Chat entre amigos (opcional)
- [ ] Grupos/Clãs
- [ ] Desafios 1v1
- [ ] Compartilhamento de conquistas
- [ ] Feed de atividades

### Fase 4 - Trading Avançado
- [ ] **Trades programados** (compra/venda automática)
- [ ] Stop-loss e take-profit
- [ ] Alertas de preço personalizados
- [ ] Análise técnica (indicadores)
- [ ] Backtesting de estratégias

### Fase 5 - Monetização (Opcional)
- [ ] Loja de skins/temas
- [ ] Premium features (análises avançadas)
- [ ] Torneios pagos com prêmios
- [ ] NFT badges (blockchain)

### Melhorias Técnicas Contínuas
- [ ] PWA (Progressive Web App)
- [ ] App mobile (React Native / Flutter)
- [ ] GraphQL ao invés de REST
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] Machine Learning (recomendações de trades)

---

## 📚 Recursos e Links

### Documentação Oficial
- [Nuxt 4](https://nuxt.com/)
- [Vue 3](https://vuejs.org/)
- [Nuxt UI](https://ui.nuxt.com/)
- [Fastify](https://fastify.dev/)
- [MongoDB + Mongoose](https://mongoosejs.com/)
- [Socket.IO](https://socket.io/docs/)
- [Zod](https://zod.dev/)
- [CoinGecko API](https://www.coingecko.com/en/api)

### Ferramentas de Desenvolvimento
- [TypeScript](https://www.typescriptlang.org/)
- [Pinia](https://pinia.vuejs.org/) (State Management)
- [Pino Logger](https://getpino.io/)
- [nuxt-charts](https://nuxt.com/modules/nuxt-charts)

### Segurança
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://curity.io/resources/learn/jwt-best-practices/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

---

## 👤 Autor

**Gobs**
- GitHub: [github.com/gobs]
- LinkedIn: [linkedin.com/in/gobs]
- Email: gobs@example.com

---

## 📄 Licença

Este é um projeto pessoal de portfólio. Código disponível para estudo e referência.

---

**Última atualização:** Novembro 2025
