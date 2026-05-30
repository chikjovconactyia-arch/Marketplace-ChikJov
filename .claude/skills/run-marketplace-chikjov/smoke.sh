#!/usr/bin/env bash
# smoke.sh — verifica se o ChikJov está rodando corretamente
# Uso: bash .claude/skills/run-marketplace-chikjov/smoke.sh [BASE_URL]
# Padrão: BASE_URL=http://localhost:3000

set -euo pipefail

BASE="${1:-http://localhost:3000}"
PASS=0
FAIL=0

check() {
  local desc="$1" url="$2" expected="$3" method="${4:-GET}"
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" 2>/dev/null)
  if [ "$actual" = "$expected" ]; then
    echo "  ✓ $desc ($actual)"
    PASS=$((PASS+1))
  else
    echo "  ✗ $desc — esperado $expected, obtido $actual  [$url]"
    FAIL=$((FAIL+1))
  fi
}

echo "=== ChikJov smoke test: $BASE ==="

# Páginas públicas
check "Landing page"           "$BASE/"                       200
check "Login page"             "$BASE/auth/login"             200
check "Register page"          "$BASE/auth/register"          200

# Rotas protegidas → devem redirecionar (307) para /auth/login
check "Checkout (sem auth)"    "$BASE/checkout"               307
check "Dashboard cliente"      "$BASE/dashboard/cliente"      307
check "Dashboard empresa"      "$BASE/dashboard/empresa"      307
check "Dashboard admin"        "$BASE/dashboard/admin"        307

# APIs públicas / Stripe
check "Webhook sem assinatura" "$BASE/api/stripe/webhook"     400 POST
check "Checkout sem auth"      "$BASE/api/stripe/checkout"    307 POST
check "Portal sem auth"        "$BASE/api/stripe/portal"      307 POST

# Rota de callback de auth
check "Auth callback"          "$BASE/auth/callback"          307

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "✅ Todos os $PASS testes passaram."
  exit 0
else
  echo "❌ $FAIL teste(s) falharam / $PASS passaram."
  exit 1
fi
