# Histórico do projeto

Este arquivo registra alterações concluídas no Vetor Urbano para manter contexto entre conversas. As entradas são organizadas da mais recente para a mais antiga e resumem os arquivos afetados, a mudança e seu motivo. Requisitos e decisões detalhados continuam nos documentos específicos do projeto.

## 2026-10-11 — Consolidação da versão mais recente na `main`

- **Arquivos:** `frontend/`; README/PLAN/patch notes; documentação atual e histórica; `harness.sh` e wrapper `harness/verify.sh`; `.gitignore`; materiais de extração e vídeo; SQL histórico preservado.
- **Alteração:** merge dos históricos de `main` e `master`, incluindo melhorias locais de mapas/pins/raio/fixtures. Aplicação ativa em `frontend/`; documentos e SQL exclusivos da antiga `main` preservados como legado. Referências originais intactas.
- **Motivo:** concentrar a continuidade na branch default e remover `master` depois de verificar a preservação de conteúdo/histórico. A auditoria corrigiu os registros de branches independentes e de fontes editáveis do vídeo presentes.
- **Verificações:** lint, 56 testes e build de 449,26 kB na árvore consolidada; instalação pelo lockfile sem vulnerabilidades reportadas; documentos/sintaxe e auditoria de conteúdo passaram. Resultado final de E2E/publicação em [relatório da consolidação](consolidacao-branches-2026-10.md) e [evidências](evidencias/consolidacao-2026-10-11.json).
- **Limites:** frontend-only; divergências de contrato continuam em R0; fontes finais do vídeo ausentes. Nenhum backend, banco, nova coleta ou renderização foi iniciado.

## 2026-10-05 — Integração seletiva da demonstração na `main`

- **Arquivos:** `.gitignore`; `README.md`; `PATCH_NOTES.md`; `docs/architecture/Pipeline_Vetor_Urbano.md`; `docs/fontes-territoriais.md`; `docs/referencias/ui/`; `harness/verify.sh`; `vetor-urbano-web/`.
- **Alteração:** incorporada a demonstração à aplicação web existente, mantendo a estrutura de API, SQL e documentos canônicos da `main`; atualizadas as instruções de execução e o harness para os caminhos reais do repositório. Dados e limites da demonstração estão identificados explicitamente.
- **Motivo:** aproveitar a interface já construída sem substituir a estrutura e os contratos existentes nem apresentar funcionalidades demonstrativas como produto operacional.
- **Verificações:** `bash -n harness/verify.sh` e `bash harness/verify.sh` passaram; lint, typecheck, 6 testes, build de produção e verificações estruturais/segurança aprovados. `npm audit --audit-level=low` encontrou zero vulnerabilidades. Worker e módulo compartilhado do MapLibre retornaram HTTP 200 no servidor local. Capturas headless em 375, 390, 768 e 1200 px não mostraram overflow horizontal óbvio no estado inicial. A medição identificou placeholder `#777780` sobre `#111115` em 4,25:1, abaixo de WCAG AA. Tiles e marcadores não ficaram visíveis na captura desktop; smoke test de renderização do mapa e validação visual do formulário em telas menores continuam pendentes.

## 2026-09-24 — Shell do mapa público e alinhamento do escopo

- **Arquivos:** `AGENTS.md`; `README.md`; `docs/PROJECT-LOG.md`; `docs/architecture/Pipeline_Vetor_Urbano.md`; `docs/specs/SPEC-001-REQUIREMENTS.md`; `planejamento/MODELAGEM_DB_V1.md`; `vetor-urbano-web/README.md`; `vetor-urbano-web/src/app/app.html`; `vetor-urbano-web/src/app/app.scss`; `vetor-urbano-web/src/app/app.spec.ts`; `vetor-urbano-web/src/app/app.ts`; `vetor-urbano-web/src/index.html`; `vetor-urbano-web/src/styles.scss`.
- **Alteração:** alinhados requisitos, arquitetura, modelagem e READMEs às decisões do primeiro relato público; construído o shell responsivo do mapa com mensagens de carregamento/erro e descarte do mapa ao destruir o componente; atualizados o título da página e o teste do cabeçalho. Adicionadas diretrizes para decisões e verificações do projeto.
- **Motivo:** refletir o escopo aprovado e substituir a interface inicial de scaffold por uma apresentação honesta do mapa-base atual, sem sugerir funcionalidades ainda não implementadas.
- **Verificações:** `git diff --check` passou; `npx tsc --noEmit` passou; `npm run test -- --watch=false` passou (2 testes); `npx ng build --configuration development` passou. Esses três comandos de frontend exibiram o aviso de depreciação de `@import` Sass. `npm run build` falhou ao buscar Google Fonts (`EAI_AGAIN fonts.googleapis.com`). Inspeção visual responsiva não executada. Busca por credenciais não encontrou valores secretos nos arquivos de código alterados.

## 2026-09-24 — Decisões do primeiro relato público

- **Arquivos:** `docs/specs/SPEC-001-REQUIREMENTS.md`; `docs/architecture/Pipeline_Vetor_Urbano.md`; `planejamento/MODELAGEM_DB_V1.md`; `README.md`; `AGENTS.md`; `vetor-urbano-web/README.md`; `docs/PROJECT-LOG.md`.
- **Alteração:** registrados como aprovados a publicação de `REPORTED` com aviso “não verificado”, o clique com confirmação do ponto, seis categorias, quatro gravidades escolhidas pelo relator, campos mínimos do envio, MVP local e V1 reduzida a ocorrências públicas. O autor confirmou que V1 foi apenas escrita; controles contra abuso e retirada ficam como condição antes de expor envios na internet.
- **Motivo:** orientar contrato, mapa e modelagem pelas decisões do produto, mantendo o primeiro fluxo explicável e distinguindo demonstração local de publicação externa.
- **Verificação:** conferência documental e `git diff --check`; nenhuma alteração de código ou migração foi executada.

## 2026-09-24 — Pipeline alinhado ao estado atual

- **Arquivos:** `docs/architecture/Pipeline_Vetor_Urbano.md`; `README.md`; `vetor-urbano-web/README.md`; `AGENTS.md`; `docs/PROJECT-LOG.md`.
- **Alteração:** atualizado o estado real do frontend, API, banco e verificações; corrigidas referências à cópia ausente do pipeline e ao README gerado pelo Angular; incluída sequência de próximos passos e decisões ainda abertas. Reorganizado o cabeçalho deste histórico.
- **Motivo:** permitir planejar incrementos sem tratar scaffold, SQL não executado ou verificações antigas como entregas prontas.
- **Verificações:** `npx tsc --noEmit` passou; `npm run test -- --watch=false` passou (2 testes, com aviso Sass); build de desenvolvimento passou (com aviso Sass); `npm run build` falhou ao acessar Google Fonts (`EAI_AGAIN`). Conferidos arquivos do projeto e documentação; nenhuma alteração de código foi feita nesta tarefa.

## 2026-09-24 — Diagnósticos e autorização para alterações de código

- **Arquivos:** `AGENTS.md`; `docs/PROJECT-LOG.md`.
- **Alteração:** instruções agora pedem evidências, impacto e encaminhamento prático ao relatar problemas ou melhorias. Para recomendações que alterem código, exigem escopo e arquivos definidos, proposta concreta e autorização antes da edição; pedidos diretos autorizam apenas o escopo solicitado.
- **Motivo:** tornar os diagnósticos acionáveis sem implementar mudanças de código não aprovadas.
- **Verificação:** conferência manual das instruções e do histórico. Nenhuma verificação de código foi necessária para esta alteração documental.

## 2026-09-24 — Verificação do frontend e correção de teste desatualizado

- **Arquivos:** `vetor-urbano-web/src/app/app.spec.ts`; `docs/PROJECT-LOG.md`.
- **Alteração:** atualizada a expectativa do teste do título para verificar “Mapa público”, que substituiu o texto padrão do scaffold.
- **Motivo:** a execução da suíte encontrou uma asserção antiga e incorreta para a interface atual.
- **Verificações:** `bash harness/verify.sh` terminou com sucesso, mas não cobre os módulos reais porque procura `frontend/` e `backend/`; `npx tsc --noEmit` passou; `npm run test -- --watch=false` passou (2 testes); `npx ng build --configuration development` passou com aviso de depreciação do `@import` Sass; `npm run build` não concluiu porque o otimizador Angular não conseguiu acessar Google Fonts (`EAI_AGAIN fonts.googleapis.com`). A inspeção visual em 375, 390, 768 e 1200 px não foi concluída: o Firefox headless instalado encerrou com código 139, e não há outra ferramenta de navegador disponível. Portanto, o Definition of Done permanece parcialmente pendente.

## 2026-09-24 — Protocolo de verificação contínua

- **Arquivos:** `AGENTS.md`; `docs/PROJECT-LOG.md`.
- **Alteração:** adicionada a Seção 6 com Definition of Done para compilação e tipos, testes, validação de interface responsiva e verificações defensivas de segurança. A regra exige reportar resultados e pendências antes de encerrar tarefas com código; esclarece que mudanças apenas documentais não exigem testes de código.
- **Motivo:** tornar os critérios de verificação previsíveis e evitar declarar concluído código que não foi compilado, testado ou validado nas áreas afetadas.
- **Verificação:** leitura e conferência manual da seção e do histórico. Não foram executados testes de código porque esta tarefa altera apenas documentação.

## 2026-09-24 — Registro de alterações entre conversas

- **Arquivos:** `AGENTS.md`; `docs/PROJECT-LOG.md`.
- **Alteração:** as instruções agora exigem atualizar este histórico sempre que uma tarefa criar, atualizar, remover ou mover arquivos ou outros elementos do projeto. Cada entrada deve informar data, arquivos, descrição e motivo, além de decisões e verificações relevantes. Criado este documento como registro cronológico inverso.
- **Motivo:** manter um resumo rastreável do trabalho e seu contexto para consultas em conversas futuras, sem depender de copiar e colar o histórico do chat.
- **Verificação:** conferência manual das instruções e da entrada criada; nenhuma verificação de código foi necessária para esta alteração documental.
