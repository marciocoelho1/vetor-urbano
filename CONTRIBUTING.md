# Contribuir com o Vetor Urbano

`main` é a branch de continuidade. O projeto é um monorepo: aplicação Angular em `apps/web/`, módulo Java ainda não implementado em `apps/api/`. Consulte [estrutura](docs/development/repository-layout.md), [escopo](docs/product/scope.md), [arquitetura](docs/architecture/overview.md) e `PLAN.md` antes de iniciar trabalho.

## Fluxo de uma alteração

1. Atualize `main` e confira o estado local. Use `git pull --ff-only` para não criar merge acidental ao sincronizar.
2. Crie uma branch curta conforme o assunto: `feat/<assunto>`, `fix/<assunto>`, `refactor/<assunto>`, `docs/<assunto>` ou `chore/<assunto>`.
3. Faça um incremento relacionado à tarefa. Preserve dados fictícios, requisitos e referências; atualize documentação e contratos quando o comportamento correspondente mudar.
4. Execute as verificações adequadas. Registre comandos, resultados e bloqueios reais.
5. Use um commit descritivo, como `refactor(repo): organize application directories`. Publique a branch e abra um pull request para `main`, seguindo o modelo do repositório.
6. Após revisão, faça o merge e remova a branch temporária. Não manter `master`/`develop` paralelas nem reescrever o histórico da `main`.

Exemplo de preparação, partindo de um diretório sem mudanças pendentes:

```bash
git switch main
git pull --ff-only
git switch -c feat/filtro-periodo
```

Alterações administrativas com push direto já autorizado pelo responsável podem ser commitadas na `main`, como a consolidação e a organização deste repositório. Isso não autoriza deploy, publicação da aplicação, contratação ou alteração de dados reais.

## Desenvolvimento e verificações

Instale as dependências web pelo lockfile:

```bash
cd apps/web
npm ci
npm start
```

Na raiz do repositório:

```bash
bash scripts/verify.sh planning
bash scripts/verify.sh web
```

Para a matriz E2E, em `apps/web/`:

```bash
npx playwright install firefox chromium
CI=true npm run test:e2e -- --workers=1
```

O modo `web` executa lint, testes unitários e build. `planning`/`docs` verificam estrutura documental. `api` e `all` devem falhar enquanto o módulo Java não tiver aplicação e testes esperados; SQL não aplicado não substitui backend. O comando antigo `bash harness.sh frontend` continua encaminhando para `web`; `backend` continua como alias de `api`.

O modelo de pull request orienta a revisão, mas não executa CI. Não há workflow GitHub Actions configurado nesta entrega; resultados locais precisam ser informados. Leitor de tela/aparelho físico, PostGIS real e outros gates seguem o estado do `PLAN.md`.

## Convenções

- Diretórios por responsabilidade e nomes em inglês, minúsculos e `kebab-case`; classes/arquivos do Angular e Java seguem as convenções próprias de cada tecnologia.
- Aplicações em `apps/`; ferramentas em `tools/`; verificações em `scripts/`; documentos atuais fora de `docs/archive/`.
- Testes unitários junto do código web; E2E em `apps/web/e2e/`. Os testes Java futuros ficam em `apps/api/src/test/`.
- Segredos, dependências, caches e saídas locais ficam fora do Git. Não incluir dados pessoais nem credenciais em exemplos, fixtures ou logs.
- `PLAN.md` é o único roadmap. `PATCH_NOTES.md` registra mudanças; `docs/history/project-log.md` mantém o histórico; decisões atuais ficam nos documentos de produto/arquitetura.
