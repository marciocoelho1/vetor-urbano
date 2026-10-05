# Vetor Urbano

Aplicação demonstrativa para consulta e análise geográfica de ocorrências, com evolução possível para colaboração e alertas. Stack planejada: **Angular + SCSS, Java e PostgreSQL/PostGIS**.

## Estado implementado

Existe uma **demonstração frontend Angular** em `frontend/`, derivada da identidade visual dos anexos: navegação entre mapa e cadastro, filtros acumuláveis, formulário progressivo por categoria, lista alternativa e modo de mancha térmica. Os registros e POIs visíveis são sintéticos e ficam em memória no navegador.

Ainda **não existe backend Java executável, API, autenticação, persistência PostgreSQL/PostGIS ou fluxo real de moderação**. O botão valida o cadastro demonstrativo, mas não envia dados. Não publicar nem usar a interface para decisões de segurança.

O mapa-base usa tiles OpenStreetMap com atribuição visível e depende de conexão/WebGL. O worker MapLibre e seu módulo compartilhado são servidos como assets locais; a execução real do worker ainda precisa de smoke test em navegador. A camada de domínio territorial permanece indisponível: as fontes indicadas não forneceram geometrias/licença verificáveis para integração. Veja `docs/fontes-territoriais.md`. Não há polígonos ou alegações territoriais fictícias no mapa.

O recorte territorial solicitado é a cidade do Rio de Janeiro e a Baixada Fluminense. A lista de municípios e os limites ainda não foram definidos; não declarar cobertura completa.

## Organização existente

| Caminho | Finalidade |
|---|---|
| `AGENTS.md` | Regras estáveis de colaboração, segurança e verificação |
| `PLAN.md` | Estado real, evidências, marcos e único detalhamento da próxima tarefa |
| `PATCH_NOTES.md` | Alterações desta entrega, verificações e pendências conhecidas |
| `docs/escopo.md` | MVP, RF/RNF classificados, regras a validar e aceites |
| `docs/arquitetura.md` | Alternativas, modelo mínimo, contrato HTTP preliminar e limitações |
| `docs/skills-externas.md` | Comparação de repositórios, seleção, licenças e ativação das skills locais |
| `docs/implementacao-2026-10.md` | Requisitos e contrato planejados para a evolução full-stack |
| `docs/fontes-territoriais.md` | Auditoria das fontes, comparabilidade, licença e limites de uso |
| `docs/referencias/contextoInicial.md` | Requisitos funcionais e não funcionais de origem |
| `docs/referencias/ui/` | HTML/SCSS originais preservados |
| `.hermes/skills/` | Skills selecionadas e restritas a este projeto |
| `harness.sh` | Convenção local de verificações, executada explicitamente |
| `.gitignore` | Exclusão de segredos e artefatos locais de build |

`frontend/` contém o protótipo Angular. `backend/` ainda não tem uma aplicação executável. Não foram criados diretórios vazios de decisão para escolhas não aprovadas.

## Executar a demonstração

Executar na raiz da pasta:

```bash
cd frontend
npm ci
npm start
```

Para verificações do frontend, na pasta `frontend/`:

```bash
npm run lint
npm run test:ci
npm run build
```

- O mapa real depende de WebGL e rede para buscar tiles; se indisponível, a lista e os filtros continuam acessíveis.
- Os exemplos de formulário não são enviados. Sem API Java, autenticação de Operador e aprovação, nenhum registro será persistido/publicado.
- O provedor público de tiles é apenas para demonstração de baixo volume; escolher serviço adequado antes de publicar ou escalar.
- `bash harness.sh docs` verifica orientação e referências; `bash harness.sh planning` exige os documentos de planejamento históricos; `bash harness.sh frontend` executa lint, testes e build.

**Os modos documentais não comprovam o produto.** Testes de unidade/build do frontend não comprovam API, banco real, segurança, acessibilidade completa ou desempenho. Resultados efetivamente executados estão em `PLAN.md`.

Os modos `backend` e `all` continuam bloqueados enquanto a aplicação Java e seus testes de integração PostGIS não existirem. O harness não instala dependências nem cria testes. Suítes ausentes/ignoradas não podem ser tratadas como sucesso.

## Como continuar

1. Evoluir a fatia vertical do formulário com API Java e persistência PostGIS, sem endpoint de escrita público.
2. Implementar autenticação/autorização de Operador e fila de moderação antes de permitir envio real.
3. Corrigir a cobertura territorial (municípios/limites) e escolher provedores/fontes licenciados antes de habilitar dados reais ou polígonos.
4. Completar testes de integração em PostgreSQL/PostGIS e o roteiro ponta a ponta; ver `docs/implementacao-2026-10.md`.

Princípio de trabalho: contrato e dados cedo; incrementos que atravessam banco, API e interface; testes reais. A interface atual é uma base visual e interativa, não uma entrega full-stack.

As referências visuais originais foram preservadas; `visuais/` continua disponível para comparação e não integra o build Angular. O histórico de alterações desta entrega está em `PATCH_NOTES.md`.
