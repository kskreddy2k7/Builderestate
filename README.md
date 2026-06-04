# BuildEstate — Unified Real Estate & Construction Platform

> One platform for builders, brokers, buyers, contractors, site engineers, and suppliers.

[![CI/CD](https://github.com/buildestate/buildestate/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/buildestate/buildestate/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Overview

BuildEstate is a single, integrated SaaS platform that digitises the complete real estate and construction lifecycle — from property listing through booking, construction tracking, and final handover. It is **not** multiple applications — it is one monorepo, one database, one auth system.

### 10 Modules, 9 Roles, 1 Platform

| Module | Primary Role |
|---|---|
| Real Estate Marketplace | Public / Buyer / Broker |
| Construction Management | Builder / Site Engineer |
| Builder ERP & Finance | Builder |
| Broker CRM | Broker / Agent |
| Contractor Management | Contractor / Builder |
| Material Marketplace | Supplier / Contractor |
| Buyer Portal | Buyer |
| Site Engineer Portal | Site Engineer |
| Admin Portal | Admin / Super Admin |
| AI Assistant | All roles |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, TailwindCSS, ShadCN UI, Framer Motion |
| Backend | NestJS, Fastify, TypeScript |
| Database | PostgreSQL 16, Prisma ORM |
| Cache | Redis 7 |
| Search | Elasticsearch 8 |
| File Storage | AWS S3 + CloudFront |
| Queue | Bull (Redis-backed) |
| Auth | JWT + OAuth (Google), RBAC |
| Payments | Razorpay |
| AI | OpenAI GPT-4o |
| Infrastructure | Docker, Kubernetes (AWS EKS) |
| Monorepo | Turborepo + pnpm workspaces |

---

## Project Structure

```
buildestate/
├── apps/
│   ├── web/          # Next.js 15 frontend — all dashboards
│   └── api/          # NestJS backend — all modules
├── packages/
│   ├── types/        # Shared TypeScript interfaces
│   ├── utils/        # Shared utilities (format, date, validation)
│   ├── ui/           # Shared React component library
│   └── config/       # Shared ESLint, TS, Tailwind configs
└── infra/
    ├── docker/       # Dockerfiles + Compose
    ├── k8s/          # Kubernetes manifests
    └── terraform/    # AWS infrastructure as code
```

---

## Prerequisites

- Node.js >= 20
- pnpm >= 9.6
- Docker + Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/buildestate/buildestate.git
cd buildestate
pnpm install
```

### 2. Start infrastructure services

```bash
pnpm docker:up
# Starts: PostgreSQL, Redis, Elasticsearch, MinIO, MailHog
```

### 3. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit both files with your local/dev credentials
```

### 4. Set up the database

```bash
pnpm db:migrate   # Run all Prisma migrations
pnpm db:seed      # Seed demo data + user accounts
```

### 5. Start development servers

```bash
pnpm dev
# API:  http://localhost:4000
# Web:  http://localhost:3000
# Docs: http://localhost:4000/api/docs
```

---

## Demo Accounts

After seeding, the following accounts are available (password: `Password@123`):

| Role | Email |
|---|---|
| Super Admin | superadmin@buildestate.in |
| Admin | admin@buildestate.in |
| Builder | builder@buildestate.in |
| Broker | broker@buildestate.in |
| Buyer | buyer@buildestate.in |
| Contractor | contractor@buildestate.in |
| Site Engineer | engineer@buildestate.in |
| Supplier | supplier@buildestate.in |

---

## Available Scripts

```bash
pnpm dev              # Start all apps in development mode
pnpm build            # Build all apps and packages
pnpm test             # Run all test suites
pnpm lint             # Lint all workspaces
pnpm type-check       # TypeScript check across monorepo
pnpm db:migrate       # Deploy Prisma migrations
pnpm db:seed          # Seed demo data
pnpm db:studio        # Open Prisma Studio
pnpm docker:up        # Start dev infrastructure
pnpm docker:down      # Stop dev infrastructure
pnpm docker:logs      # Tail infrastructure logs
```

---

## API Documentation

Swagger UI is available at `http://localhost:4000/api/docs` in development mode.

---

## Implementation Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Monorepo + Auth + DB + Frontend shell | ✅ Complete |
| 2 | Marketplace + Builder ERP + Construction | 🔜 Next |
| 3 | CRM + Buyer Portal + Payments | Planned |
| 4 | Contractor + Materials + Site Engineer | Planned |
| 5 | AI Assistant + Analytics + Production | Planned |

---

## Contributing

This project uses conventional commits. Run `pnpm prepare` to set up git hooks.

```
feat(crm): add lead scoring algorithm
fix(auth): handle expired refresh token edge case
docs(api): update swagger tags for materials module
```

---

## License

MIT — see [LICENSE](LICENSE)
