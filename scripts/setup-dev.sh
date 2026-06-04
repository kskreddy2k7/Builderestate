#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# BuildEstate — Development Environment Bootstrap
# Run: chmod +x scripts/setup-dev.sh && ./scripts/setup-dev.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m"

log() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }
section() { echo -e "\n${BOLD}── $1 ──${NC}"; }

# Check prerequisites
section "Checking prerequisites"

command -v node >/dev/null 2>&1 || error "Node.js not found. Install from https://nodejs.org"
NODE_VERSION=$(node --version | cut -d. -f1 | tr -d 'v')
[ "$NODE_VERSION" -ge 20 ] || error "Node.js 20+ required (found $(node --version))"
log "Node.js $(node --version)"

command -v pnpm >/dev/null 2>&1 || { warn "Installing pnpm..."; npm install -g pnpm@9.6.0; }
log "pnpm $(pnpm --version)"

command -v docker >/dev/null 2>&1 || error "Docker not found. Install from https://docs.docker.com"
log "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"

# Install dependencies
section "Installing dependencies"
pnpm install
log "Dependencies installed"

# Setup environment files
section "Setting up environment files"

if [ ! -f apps/api/.env ]; then
  cp apps/api/.env.example apps/api/.env
  warn "Created apps/api/.env from template — update with real credentials"
else
  log "apps/api/.env exists"
fi

if [ ! -f apps/web/.env.local ]; then
  cp apps/web/.env.example apps/web/.env.local
  warn "Created apps/web/.env.local from template"
else
  log "apps/web/.env.local exists"
fi

# Start Docker services
section "Starting infrastructure services"
docker compose -f infra/docker/docker-compose.dev.yml up -d

# Wait for Postgres
echo "Waiting for PostgreSQL to be ready..."
for i in $(seq 1 30); do
  docker compose -f infra/docker/docker-compose.dev.yml exec -T postgres pg_isready -U buildestate -d buildestate_dev >/dev/null 2>&1 && break
  sleep 1
done
log "PostgreSQL ready"

# Wait for Redis
echo "Waiting for Redis..."
for i in $(seq 1 10); do
  docker compose -f infra/docker/docker-compose.dev.yml exec -T redis redis-cli ping >/dev/null 2>&1 && break
  sleep 1
done
log "Redis ready"

# Database setup
section "Setting up database"
cd apps/api
pnpm db:generate
log "Prisma client generated"

pnpm db:migrate:dev --name init 2>/dev/null || pnpm db:migrate
log "Migrations applied"

pnpm db:seed
log "Database seeded"

cd ../..

section "Setup complete!"
echo ""
echo "  📦 Services running:"
echo "     PostgreSQL : localhost:5432"
echo "     Redis      : localhost:6379"
echo "     MailHog    : http://localhost:8025"
echo "     MinIO      : http://localhost:9001 (minioadmin / minioadmin123)"
echo ""
echo "  🚀 Start development:"
echo "     pnpm dev"
echo ""
echo "  📚 Then open:"
echo "     Web : http://localhost:3000"
echo "     API : http://localhost:4000"
echo "     Docs: http://localhost:4000/api/docs"
echo ""
echo "  👤 Demo accounts (password: Password@123):"
echo "     Builder  : builder@buildestate.in"
echo "     Broker   : broker@buildestate.in"
echo "     Buyer    : buyer@buildestate.in"
echo "     Engineer : engineer@buildestate.in"
echo ""
