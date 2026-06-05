# 💰 Sena Family Finance — v5.0.0

> Gestão inteligente de finanças familiares. **Self-Hosted**, seguro e moderno.

## Arquitetura

```
appfinancas/
├── backend/     → Express + Prisma + PostgreSQL + JWT
├── frontend/    → React + Vite + Tailwind CSS + Nginx
└── docker-compose.yml
```

## Tecnologias

| Camada | Stack |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS 4, Recharts, Lucide Icons |
| **Backend** | Express 5, Prisma ORM, PostgreSQL 15, JWT, Bcrypt |
| **Infra** | Docker Compose, Nginx (reverse proxy), Cloudflare Tunnel |
| **Admin** | pgAdmin 4 |

## Quick Start (Desenvolvimento)

```bash
# 1. Instalar dependências
cd backend && npm install
cd ../frontend && npm install

# 2. Configurar o banco PostgreSQL local
# Crie um banco com as credenciais de backend/.env

# 3. Aplicar schema e seed
cd backend
npx prisma db push
node prisma/seed-prod.js

# 4. Rodar em dev
cd .. && npm run dev
```

## Deploy (Produção com Docker)

```bash
# 1. Copie e configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 2. Build e deploy
docker-compose up -d --build

# 3. Acesse
# Frontend: http://localhost:3025
# pgAdmin:  http://localhost:5053
```

## Variáveis de Ambiente

Consulte o [.env.example](.env.example) para a lista completa de variáveis.

## Documentação

- [Guia de Refatoração e Arquitetura](GUIA_REFATORACAO_ARQUITETURA.md)
