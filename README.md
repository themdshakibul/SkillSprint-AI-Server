# SkillSprint AI — Backend

Express 5 + TypeScript 7 + MongoDB REST API.

## Tech Stack

| Library | Purpose |
|---------|---------|
| Express 5 | HTTP framework |
| TypeScript 7 | Language |
| Mongoose 9 | MongoDB ODM |
| Zod 4 | Request validation |
| jsonwebtoken + bcryptjs | Auth (JWT, password hashing) |
| OpenRouter (openai SDK) | AI/LLM calls (mock mode when key absent) |
| multer | File uploads |
| express-rate-limit | Rate limiting (AI routes: 10 req/min) |
| nodemon + tsx | Dev tooling |

## Prerequisites

- Node.js 20+
- MongoDB instance (local or Atlas)

## Setup

```bash
npm install
cp .env.example .env
# fill in MONGODB_URI, JWT_SECRET
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with nodemon + tsx (port 5000) |
| `npm run build` | `tsc` → `dist/` |
| `npm run start` | Production start from `dist/` |
| `npm run seed` | Seed 2 mentors + 10 services + reviews |

## Environment

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `PORT` | No | `5000` | |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Token signing key |
| `OPENAI_API_KEY` | No | — | Enables real AI; mock mode if absent |
| `CLIENT_URL` | No | `http://localhost:3000` | CORS origin |

## API Routes

| Path | Auth | Description |
|------|------|-------------|
| `POST /api/auth/register` | No | Register user |
| `POST /api/auth/login` | No | Login |
| `POST /api/auth/demo` | No | Demo login |
| `GET /api/auth/me` | Required | Current user |
| `GET /api/services` | No | List services (with pagination, filters) |
| `GET /api/services/:id` | No | Single service |
| `POST /api/services` | Required | Create service |
| `GET /api/ai/recommendations` | Required | AI recommendations |
| `POST /api/ai/chat` | Required | Chat assistant |
| `POST /api/ai/generate-service` | Required | AI content generation |
| `POST /api/ai/analyze-document` | Required | Document analysis |
| `POST /api/orders` | Required | Create order |
| `GET /api/orders/me` | Required | My orders (buyer) |
| `GET /api/orders/mentor` | Required | My orders (mentor) |

## Deploy

Deploys to Vercel as a serverless function via `api/index.js`.
