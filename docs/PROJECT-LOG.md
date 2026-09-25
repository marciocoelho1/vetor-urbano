# Histórico do projeto

Este arquivo registra alterações concluídas no Vetor Urbano para manter contexto entre conversas. As entradas são organizadas da mais recente para a mais antiga e resumem os arquivos afetados, a mudança e seu motivo. Requisitos e decisões detalhados continuam nos documentos específicos do projeto.

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
