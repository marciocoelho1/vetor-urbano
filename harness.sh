#!/usr/bin/env bash
# Convenção local de verificações. Não é um executor autônomo do Hermes.
set -Eeuo pipefail

VU_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd -- "$VU_ROOT"

trap 'vu_rc=$?; printf "FALHA: verificação interrompida na linha %s (status %s).\n" "$LINENO" "$vu_rc" >&2; exit "$vu_rc"' ERR

usage() {
  cat <<'HELP'
Uso: bash harness.sh {docs|planning|frontend|backend|all|help}

docs      Confere os arquivos de orientação/referência e a sintaxe deste Bash.
planning  Confere docs + presença dos documentos atuais de produto/roadmap.
frontend  Exige projeto e dependências locais; executa lint, test:ci e build.
backend   Exige Maven Wrapper, Java e Docker; executa Maven clean verify.
all       Executa planning, frontend e backend; exige as duas aplicações.

Sem argumento: mostra esta ajuda. Não assume que algum teste passou.
Status: 0 = comando concluído; 2 = uso/pré-requisito ausente;
outros erros = status devolvido pela ferramenta que falhou.

docs/planning conferem estrutura, não qualidade dos requisitos nem produto.
frontend está disponível; backend/all ficam bloqueados até existir a aplicação Java.
HELP
}

blocked() {
  printf 'BLOQUEADO: %s\n' "$*" >&2
  exit 2
}

require_file() {
  [[ -s "$1" ]] || blocked "arquivo ausente ou vazio: $1"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || blocked "comando não disponível: $1"
}

check_docs() {
  local vu_file
  for vu_file in \
    AGENTS.md PLAN.md \
    docs/referencias/contextoInicial.md \
    docs/referencias/ui/app.html \
    docs/referencias/ui/app.scss \
    docs/referencias/ui/styles.scss; do
    require_file "$vu_file"
  done
  bash -n "$VU_ROOT/harness.sh"
  printf 'OK: arquivos de orientação presentes e sintaxe Bash válida. Aplicação não verificada.\n'
}

check_planning() {
  check_docs
  local vu_file
  for vu_file in README.md docs/escopo.md docs/arquitetura.md docs/implementacao-2026-10.md docs/fontes-territoriais.md; do
    require_file "$vu_file"
  done
  printf 'OK: documentos de produto e roadmap presentes. Conteúdo ainda exige revisão humana.\n'
}

check_frontend() {
  require_command node
  require_command npm
  require_file frontend/package.json
  require_file frontend/package-lock.json
  [[ -d frontend/node_modules ]] || blocked 'dependências ausentes: execute npm ci em frontend após revisar o projeto.'
  (
    cd -- "$VU_ROOT/frontend"
    node <<'NODE'
const fs = require('node:fs');
const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'));
for (const name of ['lint', 'test:ci', 'build']) {
  if (typeof manifest.scripts?.[name] !== 'string' || !manifest.scripts[name].trim()) {
    console.error(`BLOQUEADO: configure o script real "${name}" em frontend/package.json.`);
    process.exit(2);
  }
}
NODE
    npm run lint
    npm run test:ci
    npm run build
  )
  printf 'OK: lint, test:ci e build do frontend concluídos.\n'
}

check_backend() {
  require_command java
  require_command docker
  require_file backend/pom.xml
  require_file backend/mvnw
  require_file backend/.mvn/wrapper/maven-wrapper.properties
  [[ -x backend/mvnw ]] || blocked 'backend/mvnw precisa de permissão de execução.'
  docker info >/dev/null 2>&1 || blocked 'Docker não está acessível; necessário aos testes de integração PostgreSQL/PostGIS via Testcontainers.'
  (
    cd -- "$VU_ROOT/backend"
    ./mvnw -B -ntp \
      -DskipTests=false -Dmaven.test.skip=false \
      -DskipITs=false -DfailIfNoTests=true clean verify
  )
  compgen -G 'backend/target/surefire-reports/TEST-*.xml' >/dev/null || blocked 'faltam relatórios Surefire de testes unitários.'
  compgen -G 'backend/target/failsafe-reports/TEST-*.xml' >/dev/null || blocked 'faltam relatórios Failsafe de integração; configure integration-test e verify no pom.xml.'
  printf 'OK: Maven clean verify concluído com relatórios unitários e de integração.\n'
}

[[ $# -le 1 ]] || blocked 'informe apenas um modo; consulte help.'
case "${1:-help}" in
  docs) check_docs ;;
  planning) check_planning ;;
  frontend) check_frontend ;;
  backend) check_backend ;;
  all)
    check_planning
    check_frontend
    check_backend
    printf 'OK: verificações configuradas concluídas. Aceite funcional e revisão continuam necessários.\n'
    ;;
  help|-h|--help) usage ;;
  *) blocked "modo desconhecido: $1; consulte help." ;;
esac
