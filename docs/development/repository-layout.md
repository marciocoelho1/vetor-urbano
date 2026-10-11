# Estrutura e fluxo do repositório

Organização adotada em 11/10/2026: **monorepo por responsabilidade**, com `apps/web` e `apps/api`. É uma convenção comum para Angular + Java no mesmo repositório, não um padrão universal ou uma obrigação de usar ferramentas de monorepo. Os nomes de pastas e novos arquivos documentais usam inglês, minúsculas e `kebab-case`; a documentação permanece em português brasileiro.

## Responsabilidades

| Caminho | Conteúdo e fluxo |
|---|---|
| `apps/web/` | Aplicação Angular executável: instalar pelo lockfile → desenvolver em `src/` → verificar unidade/build e `e2e/` |
| `apps/api/` | Módulo reservado à aplicação Java; hoje somente README e SQL não aplicado. Não executar como backend |
| `scripts/verify.sh` | Entrada de verificações: `docs`, `planning`, `web`, `api`, `all`. Resolve a raiz independentemente do diretório de execução |
| `harness.sh` | Wrapper de compatibilidade, com aliases `frontend`/`backend`; não duplica o executor |
| `tools/map-extraction/` | Script de extração e documentação; usa HTML previamente obtido com autorização. Não faz coleta automática |
| `assets/brand/video/` | MP4, brief e arquivos existentes de marca; não integra o build Angular |
| `docs/product/` | Escopo, RF/RNF, regras e contrato proposto; IDs originais preservados |
| `docs/architecture/` | Arquitetura atual e limites técnicos |
| `docs/development/` | Convenções, organização e skills existentes |
| `docs/maps/` | Fontes/limites, compatibilidade, visual e desempenho cartográfico |
| `docs/brand/` | Auditoria do vídeo e limites de reedição |
| `docs/evidence/` | Evidências datadas; registros históricos não são reescritos para parecer execução atual |
| `docs/history/` | Histórico de mudanças e consolidação de branches |
| `docs/references/` | Contexto e referências originais, preservados byte a byte |
| `docs/archive/` | Requisitos, arquitetura e modelagem legados, identificados para reconciliação em R0 |
| `.github/` | Modelo de pull request; nenhum workflow CI criado |
| `.hermes/skills/` | Skills existentes, preservadas sem alterações |

Os documentos de histórico/evidências podem citar caminhos usados na data do registro. A tabela abaixo resolve os caminhos anteriores; comandos de desenvolvimento atuais ficam no [README](../../README.md) e em [CONTRIBUTING](../../CONTRIBUTING.md).

## Caminhos anteriores e atuais

| Antes | Agora |
|---|---|
| `frontend/` | `apps/web/` |
| `vetor-urbano-api/` | `apps/api/` |
| `harness.sh` (executor) e `harness/verify.sh` (wrapper) | `scripts/verify.sh` (executor) e `harness.sh` (wrapper) |
| `mapa-rj-extraction/` | `tools/map-extraction/` |
| `videos/vetor-urbano-motion/` | `assets/brand/video/` |
| `visuais/` | `docs/references/ui-prototype/` |
| `docs/referencias/` | `docs/references/`; `contextoInicial.md` passa a `initial-context.md` |
| `docs/escopo.md` | `docs/product/scope.md` |
| `docs/arquitetura.md` | `docs/architecture/overview.md` |
| `docs/implementacao-2026-10.md` | `docs/product/implementation-2026-10.md` |
| Documentos de mapas antes na raiz de `docs/` | `docs/maps/`, com nomes por assunto |
| `docs/skills-externas.md` | `docs/development/project-skills.md` |
| `docs/video-marca.md` | `docs/brand/video-audit.md` |
| `docs/PROJECT-LOG.md` e relatório da consolidação | `docs/history/` |
| `docs/evidencias/` | `docs/evidence/` |
| `docs/specs/`, pipeline antigo e `planejamento/` | `docs/archive/specifications/`, `docs/archive/architecture/`, `docs/archive/database/` |
| `LEIA-ME.md` e `verificacao.json` da ferramenta | `tools/map-extraction/README.md` e `verification.json` |

## Fluxo e organização interna

Mudança de produto/documentação → branch temporária → implementação no módulo correspondente → verificações → pull request → revisão → merge em `main` → remoção da branch temporária. O procedimento e exemplos estão em [CONTRIBUTING](../../CONTRIBUTING.md).

O frontend mantém o layout próprio do Angular: `src/`, `public/`, configuração do projeto, testes unitários próximos do código e Playwright em `e2e/`. O pacote passa a `@vetor-urbano/web` e o projeto Angular a `web`; dependências e versões ficam preservadas no lockfile. Build padrão em `apps/web/dist/web/`.

A API mantém `src/main/resources/db/migration/` para o rascunho SQL existente, sem alterar seu conteúdo. A aplicação Spring Boot, testes e migrações ativas só poderão ser criados no incremento autorizado de backend. Não foram criados `packages/`, `infra/`, serviços ou configurações de deploy sem uso concreto.

## Limites preservados

A mudança reorganiza caminhos/configurações; não muda regras, aparência, dados, provedor de mapas ou tecnologias. Polígonos/pins/licenças continuam nos assets públicos da aplicação. Downloads locais e caches foram movidos com suas pastas, continuam ignorados e não serão enviados ao GitHub.

O MP4 foi preservado; fontes finais editáveis continuam ausentes conforme a [auditoria](../brand/video-audit.md). Não houve edição, renderização ou publicação de vídeo. A reestruturação não inicia a API nem comprova PostGIS.

## Evidências da reorganização

`npm ci --prefix apps/web` passou sem alterar dependências/versões; lint, 56 testes e build 449,26 kB passaram. A matriz Firefox/Chromium passou com 44 E2E e zero ignorados. O wrapper `harness.sh frontend` executou a mesma verificação a partir de `/tmp`, validando raiz/aliases. Links locais e ignores foram conferidos.

75 arquivos críticos preservados por SHA-256, incluindo código, testes, assets, referências, SQL, vídeo e skills. O script de extração passou em scratch isolado com HTML já disponível, 1.671 polígonos e ZIP íntegro; o README não foi sobrescrito. `api`/`backend` retornam 2 por ausência de `apps/api/pom.xml`. Ver [evidência estruturada](../evidence/repository-layout-2026-10-11.json).
