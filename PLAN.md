# Vetor Urbano — plano de trabalho

Atualização: 10/10/2026 (America/Sao_Paulo). Convenção de continuidade do projeto, não configuração executável do agente. **Este é o único roadmap ativo; nenhum plano paralelo em `.hermes/plans/` foi gerado.**

## Estado real

- Incremento frontend-only autorizado em 10/10/2026: correções de filtros/calendário, troca de categoria, mapa/lista, formulário com coordenadas e detalhe inline por resultado (toggle, limite de cinco) concluídas. Os presets de período agora têm 6 px de espaçamento; o botão “Detalhes” alinha com o ícone do item.
- Existe: shell Angular, consultas locais, estatísticas sintéticas, histórico, informes ativos, dashboard, reprodução temporal, comparação, filtros salvos, triagem manual, exportação XLSX e importação local de CSV agregado/GeoJSON. Camadas de calor de eventos e POIs são distintas. O raio local usa centro no mapa ou coordenadas, 100–5.000 m e círculo `#C4B5FD`; não substitui PostGIS.
- Renderização: MapLibre 6.11.2/OpenFreeMap Bright é principal quando WebGL2 existe. Sem WebGL2, Leaflet 1.9.4 + CSS são carregados sob demanda; tiles e atribuição vêm de `frontend/public/maps/raster-provider.json`, trocável sem recompilar JavaScript. O fallback preserva pontos, popups, heat layers, raio, áreas filtradas e mapa inline do cadastro; Leaflet usa Canvas 2D quando disponível e SVG quando não. A lista continua disponível se os dois mapas falharem.
- Fontes: somente catálogo e importação manual com origem, URL, licença, data de referência e limitações; ficam em memória na aba. Não há coleta automática de ocorrências, API externa de dados, credenciais ou conteúdo jornalístico baixado. Estatísticas agregadas não viram pins; territórios permanecem demonstrativos, atribuídos à fonte e sem afirmar risco atual.
- Não existe: backend Java executável, API, autenticação/autorização, PostgreSQL/PostGIS, persistência no servidor, moderação real ou atualização em tempo real. Nenhuma ocorrência real foi ingerida.
- Verificação: `bash harness.sh frontend` retornou 0 (lint, 47 testes, build); bundle inicial 439,56 kB, abaixo do limite 500 kB, sem avisos. MapLibre JS/CSS (1,07 MB/83,13 kB), Leaflet JS/CSS (149,42/11,07 kB), importação, XLSX e geometria do raio são lazy. `npm run test:e2e -- --workers=1`: 15 passados, 1 ignorado (fallback sem WebGL2 é específico de Firefox); cobre worker/WebGL2, mapas/raio/territórios, cadastro, detalhes até cinco, XLSX, teclado, responsividade e os ajustes visuais. `bash harness.sh planning`, `bash harness.sh docs` e `git diff --check` também passaram.
- Smoke test de rede separado: Firefox 157 headless com WebGL2 desativado carregou tiles OSM reais no mapa público (9/9 HTTP 200) e no mapa de cadastro (15/15 HTTP 200); `Referer` e User-Agent padrão Firefox presentes, atribuição visível e clique no mapa preencheu coordenadas. Isso comprova a execução desta sessão, não SLA/estabilidade futura. Captura confirmou tiles contínuos; a suíte Playwright intercepta tiles para repetibilidade.
- QA visual automatizado: Chromium/Firefox em desktop e larguras 390/320 px; detalhe inline, mapa de cadastro e prompt do raio conferidos. Ainda sem auditoria manual com leitor de tela, aparelhos físicos ou validação de desempenho. Nenhuma API, backend ou banco foi iniciado.
- Próximos gates antes de backend: revisão manual de acessibilidade em leitor de tela/aparelho real; fechar R0 (escopo/matriz RBAC/moderação); definir municípios/limites para declarar cobertura e aprovar termos, contato e disponibilidade do provedor de mapas antes de qualquer publicação.
- Skills externas: três foram copiadas para `.hermes/skills/` após avaliação comparativa em `docs/skills-externas.md`; estão ativas como skills de projeto. Nenhuma aplicação foi alterada por essa seleção.
- Git/publicação: o commit local do snapshot está em `master`. O repositório remoto informado já possui uma branch `main` com histórico e estrutura diferentes (API em `vetor-urbano-api/`, Angular em `vetor-urbano-web/`). Para preservar esse conteúdo, manter o snapshot em uma branch `master` independente, sem sobrescrever `main`; as branches não compartilham ancestral.

## Roadmap vigente — frontend demonstrativo antes de banco/API

Os demais pontos da proposta de versão 1.0 continuam em revisão. A decisão aprovada em 10/10/2026 é concluir e validar primeiro o frontend local, sem banco, API ou alertas; depois iniciar persistência/API como incremento separado. A base cartográfica usa MapLibre/OpenFreeMap e fallback Leaflet/OSM raster sem WebGL2. A camada territorial está aprovada para demonstração local conforme autorização informada pelo responsável, sem inferir risco atual.

| Marco | Resultado observável | Requisitos / dependências | Estado |
|---|---|---|---|
| F0 — Concluir frontend demonstrativo | Correções locais; MapLibre e fallback Leaflet; mapa/cadastro; detalhes inline (toggle/teto cinco); fontes manuais; XLSX pt-BR | Sem API/banco/alertas; leitor de tela e aparelho físico seguem pendentes | `harness frontend`: lint, 47 testes, build; E2E: 15 passados/1 ignorado; smoke Firefox sem WebGL2 com tiles reais passou. |
| R0 — Fechar decisões da fase full-stack | Escopo vertical, matriz RBAC, ciclo de moderação e filtros definidos | Resolver questões em `docs/escopo.md`; realizar revisão manual de acessibilidade antes de R1 | Pendente |
| R1 — Fluxo de dados persistido | PostgreSQL/PostGIS + API Java; dados sintéticos seguem contrato para mapa e lista | Começar somente após F0; OpenAPI, migrações e testes PostGIS reais | Não iniciado |
| R2 — Mapa para além da demonstração | Provedor/infraestrutura de mapas com termos, limites, atribuição, contato e disponibilidade adequados | OpenFreeMap e tiles OSM públicos são configuração best-effort sem SLA; raster configurável, mas serviço final ainda depende de decisão | Pendente; não publicar ainda |
| R3 — Operar com segurança | Login/RBAC; Operador e Gestor cadastram; aprovação, moderação e auditoria | Regras de RBAC, sessão, senha e MFA definidas antes de escrita real | Não iniciado |
| R4 — Completar consulta/análise | Filtros do servidor, pins refinados e heatmap coerente | Definir filtros por papel e garantir igualdade mapa/lista | Protótipo local parcial; sem API |
| R5 — Territórios operacionais | Revisar camada fonte para uso mais amplo e manter origem/data/limitações | Geometrias estão na demonstração local; validade topológica, atualização e limites ainda não verificados | Demo implementada; operacional/publicação pendentes |
| R6 — Candidato a 1.0 | Fluxo integrado testado e operável em homologação | Segurança, privacidade, compatibilidade, backup/recuperação e critérios de release | Futuro; sem deploy ou aceite 1.0 |
| R7 — Alertas e evoluções | Avaliar alertas, votos, push/geofencing, escala/SLA separadamente | Não fazem parte da demonstração atual; exigem decisões de plataforma, dados e medição | Backlog; não iniciar neste incremento |

Ordem aprovada: F0 → revisão manual complementar de acessibilidade (leitor de tela/aparelho físico) → R0/R1. O QA visual/WebGL2, fallback Firefox, teclado básico e viewport móvel desta etapa passou; publicação externa, alertas e uso operacional de polígonos ficam fora desta entrega.

## Análise inicial de completude — 10/10/2026 (antes da implementação autorizada)

- Revisão solicitada: comparar o frontend de `master` com requisitos/documentação, avaliar histórico de ocorrências, informes ativos e relatórios, e apontar integrações futuras. Nenhum código da aplicação, banco ou contrato foi alterado nesta análise; as novas funcionalidades continuam propostas, sem autorização de implementação/ingestão.
- Evidência atual: `bash harness.sh frontend` retornou 0 (formatação Prettier, 10 testes e build); mantém warning de `app.scss` com 20.87 kB frente ao orçamento de 20 kB. A suíte usa mocks de MapLibre e não comprova WebGL, acessibilidade completa ou desempenho em aparelho real.
- Divergências reproduzidas em sondagem isolada dos métodos reais de `App`, com adaptadores de signals/computed, fora da suíte: refinamento de crime elimina registro que deveria permanecer pela categoria ampla; filtro de POIs exclusivos inclui os dois POIs coletivos; mudança de categoria apaga campos comuns. Inspeção também identificou períodos fixos em dias em vez de calendário, ausência de raio/intervalo personalizado, detalhes/pins/heatmap incompletos e falta de seleção do ponto de cadastro pelo mapa.
- Fontes consultadas: ISP oferece séries estatísticas agregadas, com referência temporal pelo registro policial e unidades de contagem variáveis, não uma base automaticamente convertível em pins individuais. Fogo Cruzado possui API documentada com autorização prévia. A integração autorizada/contratada com OTT, COR, imprensa e a fonte denominada “Inform RJO” ainda precisa ser definida; acesso público à interface não comprova API reutilizável. Nenhuma ocorrência real foi ingerida.
- Próxima decisão sugerida, sem alterar a ordem aprovada: priorizar correções de F0 e QA visual; em R0 reconciliar os contratos concorrentes e decidir quais propostas entram no escopo. Histórico individual, estatística agregada, estado operacional e estado de moderação precisam permanecer separados; expiração de informe não deve significar confirmação de resolução.

## Revisão de aderência do incremento frontend-only — 10/10/2026

| Entrega definida | Estado observado | Limite explícito |
|---|---|---|
| Corrigir união de filtros, exclusividade de POIs, calendário e troca de categoria | Implementado e coberto por testes | Consulta apenas local, com fixtures/importações no navegador |
| Completar mapa, detalhes, formulário, estados e alternativa em lista | Implementado no protótipo; MapLibre/WebGL2 e Leaflet 2D sem WebGL2; detalhe inline até cinco; formulário com mapas e coordenadas nas três categorias | Playwright: renderizadores em Firefox/Chromium; tiles OSM reais testados separadamente em Firefox; disponibilidade futura permanece externa |
| 1. Histórico, informes ativos e estatísticas | Três visões locais; registros pontuais e agregados mantidos separados; expiração não vira resolução | Dados importados são locais, não uma base persistente |
| 2. Detalhe completo do registro | Detalhe no próprio item da lista, abre/fecha pelo mesmo botão, até cinco registros visíveis simultaneamente; metadados incluem tipo, fonte, datas e status | Fonte externa não foi revisada/validada operacionalmente |
| 3. Consulta espacial/temporal | Calendário e intervalo customizado, horários locais, raio geográfico ajustável e centro selecionável/digitável | Cálculo aproximado no cliente; PostGIS continua pendente |
| 4. Dashboard | Contagens e séries agregadas sintéticas/importadas, com unidade e proveniência | Não é BI persistido nem cobertura estatística oficial garantida |
| 5. Exportação XLSX | Abas de resumo, pontos, agregados e fontes em pt-BR, largura/alinhamento definidos; ZIP/XML validado e arquivo aberto/conferido pelo LibreOffice | Exporta o conjunto local filtrado, não uma consulta completa de servidor |
| 6. Reprodução temporal | Slider e reprodução de registros do histórico local | Não há fluxo contínuo nem histórico de alterações da fonte |
| 7. Comparação período/território | Diferença absoluta e percentual quando as unidades coincidem; percentual omitido se a base A for zero | Não normaliza por população nem concilia fontes incompatíveis |
| 8. Filtros salvos | Reaplicação e remoção em `localStorage` | Apenas no navegador atual; não compartilháveis entre contas |
| 9. Saúde/atualização das fontes | Cartões catalogam estado planejado; exibe quando houve importação manual nesta sessão | Não consulta disponibilidade/latência nem monitora coleta automática |
| 10. Triagem/duplicidades | Referências manuais associáveis a evento, marcáveis como duplicadas ou descartadas | Sem crawler, deduplicação automática, moderação por usuário ou auditoria no servidor |

**Esqueleto de fontes:** ISP-RJ (CSV agregado), Fogo Cruzado, OTT360, COR-Rio/órgãos municipais e publicações são pontos de entrada documentados; só CSV agregado e GeoJSON de pontos podem ser selecionados manualmente. Cada importação exige origem, URL, licença/autorização, data e limitações. `Inform RJO` permanece fora do catálogo até confirmar identidade/URL. Nada é buscado por URL e nenhuma credencial fica no Angular.

**Conclusão da revisão:** o pedido frontend-only foi implementado como demonstração local, com itens 9 e 10 deliberadamente como esqueletos manuais, não integrações funcionais. Backend, banco, API, login, moderação real, atualizações externas e ingestão de ocorrências reais continuam fora da entrega.

## Contrato preliminar anterior — não é mais o roadmap aprovado

O detalhamento P1.1 abaixo descreve uma fatia antiga somente de leitura. Ele diverge da proposta mais recente de cadastro por Operador e moderação. Mantido como material técnico reaproveitável, mas **não iniciar esse contrato sem reconciliar o escopo em R0**. `docs/implementacao-2026-10.md` também contém um contrato mais amplo; nenhum dos dois deve ser tratado como decisão final por si só.

### Continuação full-stack — P1.1 (contrato legado, não implementado)

### Objetivo e limites

Ao abrir a tela local, ver uma ocorrência fictícia persistida no PostgreSQL/PostGIS e retornada pela API, tanto no mapa quanto em lista. Carregamento, erro e vazio são observáveis; o aviso de demonstração é permanente. Não incluir login, cadastro, moderação de tela, filtros, raio, heatmap, push ou dados reais.

Atende **RF02 parcialmente** e salvaguardas iniciais de **RNF02**. Não atende RF01 apenas por semear um registro; não conclui RNF01/05 por executar testes funcionais.

### Dependências antes de iniciar

1. Revisar D1/D2 e regras públicas antes de iniciar P1.1. Decisões relevantes aprovadas poderão gerar ADR curto; nenhuma aprovação inferida do silêncio.
2. O snapshot demonstrativo já possui commit local em `master`; a branch remota é independente do `main` existente. Para a futura fatia P1.1, alinhar mudanças de estrutura antes de qualquer integração ao `main`.
3. Verificar runtimes e Docker; selecionar versões exatas compatíveis e registrá-las em `docs/arquitetura.md` antes do scaffold. Não presumir dependências instaladas nem alterar configuração do sistema sem escopo.
4. Escolher mapa-base/estilo e registrar origem/licença/atribuição/limites, ou aprovar alternativa demonstrativa local; nenhuma contratação automática.
5. Confirmar hipótese de pontos demonstrativos no Rio enquanto municípios da Baixada estão indefinidos. Essa hipótese não comprova cobertura territorial.

### Contrato de dados

Fonte canônica: **`docs/arquitetura.md`, seção 5**. `GET /api/v1/ocorrencias` retorna GeoJSON FeatureCollection com id, categoria, severidade, ocorridoEm UTC, Point `[longitude, latitude]` e marca de demonstração; metadados de limite/quantidade retornada/truncamento. Seleção APROVADA + SINTETICA, teto 200 e ordem estável. Não há autoria nem escrita. Vazio é 200; entradas desconhecidas 400; banco indisponível 503. Não manter exemplos concorrentes aqui.

### Arquivos previstos — ainda não existentes

Os caminhos abaixo são propostas de organização, não símbolos encontrados; ajustar nomes ao gerador/versão antes de criar:

| Grupo | Caminhos previstos |
|---|---|
| Contrato | `docs/contratos/ocorrencias.openapi.yaml` e atualização do contrato preliminar |
| Frontend | `frontend/package.json`, `package-lock.json`, configuração Angular/testes, `src/app/features/ocorrencias/`, shell e `src/styles.scss` |
| Backend | `backend/pom.xml`, `mvnw`, `.mvn/wrapper/`, `src/main/java/<pacote-base>/ocorrencias/`, configuração sem segredos |
| Persistência | `backend/src/main/resources/db/migration/V1__criar_ocorrencia.sql`; seed local separado em `backend/src/main/resources/db/demo/` |
| Execução local | `compose.yaml` restrito ao banco local, se a proposta de Docker for aprovada; exemplos sem credenciais reais |
| Testes | testes unitários/integração em `backend/src/test/`; testes do cliente/componente junto à funcionalidade Angular; roteiro integrado de aceite |
| Continuidade | README, PLAN, arquitetura, aprendizado; harness só se comandos reais exigirem ajuste justificado |

### Sequência interna de trabalho, sem separar entregas por camada

1. Confirmar gates, fechar contrato mínimo e cenário de teste integrado; gerar apenas a estrutura necessária.
2. Escrever teste de banco/API e demonstrar falha; criar migração, seed demonstrativo e leitura com projeção pública até o teste passar.
3. Escrever testes da consulta/estados na interface; conectar a API real, renderizar marcador/lista e preservar o visual. Mocks servem à unidade, não ao aceite integrado.
4. Exercitar fluxo completo e falhas; corrigir problemas antes de registrar sucesso. Mostrar evidências e explicar um campo do banco até a tela.
5. Atualizar documentação e aprendizado; parar para revisão de produto antes de P1.2.

São passos do mesmo incremento vertical, não marcos “todo backend” e “todo frontend”.

### Aceite e verificações

- Cobrir **CA01–CA04 e CA07** de `docs/escopo.md`: registro persiste após reinício da API; resposta e marcador/lista compartilham ID; estados privados não aparecem; nenhum endpoint de cadastro; aviso de dados fictícios.
- Integração HTTP + banco real com extensão PostGIS, registro aprovado e fixtures de estados não públicos. Testar limite/truncamento e ordem, vazio, erro sem vazamento e parâmetros desconhecidos. Não trocar por H2 para obter verde.
- Testes do frontend verificam carregamento/sucesso/vazio/erro, nova tentativa e lista disponível diante de falha do mapa. Exercitar também WebGL/tiles indisponíveis.
- Executar `bash harness.sh frontend`, `bash harness.sh backend` e, com integração pronta, `bash harness.sh all`. Assegurar falha quando faltarem testes esperados; revisar relatórios de testes ignorados.
- Executar roteiro real banco → API → navegador, teclado, leitor de tela, 320/360/1280 px e zoom 200%; registrar o que não puder ser verificado. Não confundir esse roteiro com o harness.
- Sem testes de carga/metas de FPS nesta tarefa; ensaios de P1.3 permanecem abertos.

## Evidências da Fase 0

| Verificação | Resultado real | Limite |
|---|---|---|
| Leitura integral dos arquivos solicitados | Concluída; todos presentes | UI inspecionada estaticamente, sem execução Angular |
| Inventário inicial | Apenas documentos, referências e harness; nenhuma instrução adicional encontrada na árvore/ancestrais inspecionados | Não há Git para comparar com histórico anterior |
| `bash harness.sh docs` | Status 0; arquivos de orientação presentes, sintaxe Bash válida | Não verifica aplicação nem conteúdo dos requisitos |
| `bash harness.sh planning` | Em 06/10/2026, status 0 após remover exigência de documento de aprendizagem ausente | Estrutura, não testes do produto |
| `bash harness.sh help` | Status 0; ajuda dos modos exibida | Não executa verificações do produto |
| Auditoria Python pontual de rastreabilidade | Status 0; 15 RF/RNF originais com linha única de classificação; 14 regras próprias “a validar” | Confere IDs/estrutura; não substitui revisão semântica de produto |
| Parse do exemplo de contrato | Status 0; JSON, UUID, UTC, coordenadas, contagem e lista de campos consistentes | Exemplo documental; nenhuma API foi executada |
| Comparação SHA-256 com inventário anterior às edições | Status 0; referências originais de UI e harness verificadas; documentos da Fase 0 atualizados | Não reconstrói histórico Git; auditoria e baseline temporários ficaram fora do projeto |
| `sources.py verify ... --strict` no conjunto escopo + arquitetura | Status 0; 14 fontes cadastradas/citadas, IDs e referências consistentes | Valida referências, não prova automaticamente cada afirmação técnica |
| Fontes técnicas primárias | Consultadas; referências junto aos trechos de escopo/arquitetura | Matrizes documentais não substituem build; geofencing não foi testado em dispositivo |

Comandos auxiliares temporários validaram rastreabilidade e citações; os scripts, ledgers e relatórios ficaram fora do repositório e não são dependências do produto. A primeira validação individual com `--strict` retornou 1 por considerar não citadas as fontes destinadas ao outro documento; a validação conjunta estrita passou. As validações individuais normais também passaram, mantendo os avisos de ledger compartilhado.

Registro anterior à autorização de interface. Nenhum backend foi criado nem dados reais alterados; os resultados atuais das verificações frontend estão descritos no bloco `Estado real` no início deste arquivo.

## Registro histórico da Fase 0 — superado pela entrega frontend desta sessão

- Trabalho: P0 documental concluído e verificado; nenhuma nova decisão técnica aprovada. README/PLAN atualizados; escopo/arquitetura/aprendizado criados. AGENTS, harness e referências confirmados intactos naquele momento.
- Bloqueios para implementação: autorização, versionamento, versões/ambiente e mapa-base. Municípios impedem validar cobertura, mas não impedem demo limitada explicitamente aprovada.
- Dependências futuras: rubrica de severidade, estados/cadastro, faixa horária recorrente ou intervalo contínuo, retenção, políticas de sessão/MFA, arquivo de polígonos verificável, plataforma de alertas e ensaios de desempenho.
- Próxima ação daquele registro: revisão de produto; superada pelo roadmap atualizado acima.

## Incremento separado — seleção de skills (01/10/2026)

- Oito repositórios comparados antes de qualquer cópia; seleção limitada a `better-accessibility`, `better-writing` (jakubkrehel/skills) e `frontend-design` (anthropics/skills). Revisões, licenças, exclusões e ressalvas estão em `docs/skills-externas.md`. Fontes e referências de UI originais permanecem intactas.
- Instalação local: 12 arquivos em três diretórios `.hermes/skills/`, idênticos por SHA-256 às fontes fixadas; nenhuma execução dos instaladores/scripts externos, dependência, MCP ou aplicativo criado. `bash harness.sh planning` retornou 0 (somente estrutura documental).
- Ativação local: `hermes skills trust` registrou 3 skills de projeto; `skills_list` encontrou as três e `skill_view` carregou seus arquivos locais. Ressalva: `hermes skills list --source all --enabled-only` não exibe skills de projeto nesta execução; `hermes skills audit` só trata skills do Hub, portanto não comprovou inspeção destas cópias.
- Próxima decisão: revisar a seleção e o recorte/contrato D1/D2; P1.1 continua aguardando decisão de produto. O commit local está em `master`; a publicação desse snapshot é independente do `main` existente.

## Ajuste de colaboração e estado anterior à interface (01/10/2026)

- As regras de colaboração foram atualizadas para entregas pequenas, trade-offs explícitos e respeito aos limites de escopo. `AGENTS.md` atualizado; stack e gates de escopo preservados.
- Verificação histórica desta alteração: `bash harness.sh docs` retornou 0. O bloqueio antigo de `planning` por `docs/aprendizado.md` foi corrigido nesta atualização; essa trilha de exercícios não faz parte do produto.
- Próxima ação registrada naquele momento, substituída pela implementação Angular demonstrativa descrita em `Estado real`; backend Java/PostgreSQL continua pendente.
