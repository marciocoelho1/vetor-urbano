# Vetor Urbano — plano de trabalho

Atualização: 05/10/2026 (America/Sao_Paulo). Convenção de continuidade do projeto, não configuração executável do agente. **Este é o único plano ativo; nenhum plano paralelo em `.hermes/plans/` foi gerado.**

## Estado real

- Etapa autorizada: implementar a demonstração de interface solicitada no pedido de 01/10/2026. O escopo aqui entregue é **somente frontend demonstrativo**, não a entrega full-stack descrita no contrato de implementação.
- Existe: shell Angular, integração de mapa MapLibre com worker próprio e POIs/ocorrências sintéticos, módulos e filtros locais, heatmap, lista alternativa, formulário progressivo por categoria e estado explícito de envio indisponível. README e patch notes atualizados; auditoria das fontes territoriais registrada.
- Não existe: backend Java executável, API, autenticação/autorização, PostgreSQL/PostGIS, persistência, moderação real nem publicação. Nenhum dado real ou polígono territorial foi incorporado.
- Verificações em 01/10/2026: `bash harness.sh frontend` passou com a correção do worker; lint e 6 testes passaram; `ng build` passou. Bundle inicial 413.33 kB brutos, MapLibre lazy chunk 1.07 MB brutos (236.23 kB estimados de transferência). A falha original foi reproduzida: o Angular/Vite tentou buscar `maplibre-gl-worker.mjs` no cache otimizado, onde o arquivo não existia. Excluir `maplibre-gl` do prebundle não resolveu e a configuração foi removida. Worker e módulo compartilhado agora são copiados por `angular.json`; ambos retornaram HTTP 200 no dev server e aparecem byte a byte no build de produção; teste assegura `setWorkerUrl` antes da criação do mapa. **Execução real do worker no browser não verificada**, pois a sessão não permite interação/captura.
- Próxima ação: confirmar o mapa executando em navegador compatível/WebGL, rever visualmente em tela móvel e leitor de tela; depois, a continuação full-stack exige API + PostGIS + autenticação/moderação antes de habilitar envio. Municípios da Baixada e fonte/licença de polígonos continuam pendentes.
- Skills externas: três foram copiadas para `.hermes/skills/` após avaliação comparativa em `docs/skills-externas.md`; estão ativas como skills de projeto. Nenhuma aplicação foi alterada por essa seleção.
- Git/publicação: o commit local do snapshot está em `master`. O repositório remoto informado já possui uma branch `main` com histórico e estrutura diferentes (API em `vetor-urbano-api/`, Angular em `vetor-urbano-web/`). Para preservar esse conteúdo, manter o snapshot em uma branch `master` independente, sem sobrescrever `main`; as branches não compartilham ancestral.

## Marcos propostos

| Marco | Resultado observável | Requisitos / dependências | Estado |
|---|---|---|---|
| P0 — Delimitar | Documentação rastreável e próximo incremento revisável | RF01–RF07 e RNF01–RNF08 classificados | Documentado/verificado; aguarda revisão |
| P1 — Consultar (MVP de demonstração) | Dados sintéticos persistidos → API → mapa/lista; filtros e raio em incrementos seguintes | RF02 parcial, salvaguardas RNF02; medir RNF01/05 sem prometer desempenho | Em andamento apenas como protótipo frontend; API/banco pendentes |
| P2 — Operar | Identidade/permissões, cadastro, moderação e gestão de operadores | RF01, RF05–RF07, RNF06–RNF08 e revisão RNF02; MFA desde o primeiro acesso Gestor | Proposto |
| P3 — Analisar | Heatmap do mesmo conjunto filtrado | RF02 restante; contagem versus ponderação a validar | Proposto |
| P4 — Evoluir após pesquisa | Entregas independentes para votos, alertas, polígonos e escala | RF03/RF04; RNF03/04; plataforma, fontes e cenários de medição | Backlog |

P1.2 será filtro por categoria/período; P1.3 será raio/testes espaciais e ensaios de desempenho. Não detalhar nem executar agora. P2 será dividido em incrementos próprios, sem escrita desprotegida provisória. P4 não é uma implantação única; exportação/BI continuam dependentes de confirmação de escopo.

## Continuação full-stack — P1.1 (contrato proposto; ainda não implementado)

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

**Conceito a aprender:** separar persistência, contrato/DTO e estado de interface; explicar onde a publicação é filtrada e por que a lista não depende de tiles. Exercício atual e situação de aprendizado em `docs/aprendizado.md`.

## Evidências da Fase 0

| Verificação | Resultado real | Limite |
|---|---|---|
| Leitura integral dos arquivos solicitados | Concluída; todos presentes | UI inspecionada estaticamente, sem execução Angular |
| Inventário inicial | Apenas documentos, referências e harness; nenhuma instrução adicional encontrada na árvore/ancestrais inspecionados | Não há Git para comparar com histórico anterior |
| `bash harness.sh docs` | Status 0; arquivos de orientação presentes, sintaxe Bash válida | Não verifica aplicação nem conteúdo dos requisitos |
| `bash harness.sh planning` | Status 0; documentos da Fase 0 presentes | Estrutura, não testes do produto |
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
- Próxima ação: revisão de produto; depois, se autorizado, somente P1.1.
- Aprendizado: trilha de conceitos proposta; não marcar como concluída sem evidência.

## Incremento separado — seleção de skills (01/10/2026)

- Oito repositórios comparados antes de qualquer cópia; seleção limitada a `better-accessibility`, `better-writing` (jakubkrehel/skills) e `frontend-design` (anthropics/skills). Revisões, licenças, exclusões e ressalvas estão em `docs/skills-externas.md`. Fontes e referências de UI originais permanecem intactas.
- Instalação local: 12 arquivos em três diretórios `.hermes/skills/`, idênticos por SHA-256 às fontes fixadas; nenhuma execução dos instaladores/scripts externos, dependência, MCP ou aplicativo criado. `bash harness.sh planning` retornou 0 (somente estrutura documental).
- Ativação local: `hermes skills trust` registrou 3 skills de projeto; `skills_list` encontrou as três e `skill_view` carregou seus arquivos locais. Ressalva: `hermes skills list --source all --enabled-only` não exibe skills de projeto nesta execução; `hermes skills audit` só trata skills do Hub, portanto não comprovou inspeção destas cópias.
- Próxima decisão: revisar a seleção e o recorte/contrato D1/D2; P1.1 continua aguardando decisão de produto. O commit local está em `master`; a publicação desse snapshot é independente do `main` existente.

## Ajuste de colaboração e estado anterior à interface (01/10/2026)

- As regras de colaboração foram atualizadas para entregas pequenas, trade-offs explícitos e respeito aos limites de escopo. `AGENTS.md` atualizado; stack e gates de escopo preservados.
- Verificação desta alteração: `bash harness.sh docs` retornou 0. `bash harness.sh planning` retornou 2 porque `docs/aprendizado.md` não está presente; não foi recriado nem removida a exigência do harness sem decisão sobre esse documento. README e trechos históricos deste plano ainda o citam e exigem alinhamento posterior se a remoção tiver sido intencional.
- Próxima ação registrada naquele momento, substituída pela implementação Angular demonstrativa descrita em `Estado real`; backend Java/PostgreSQL continua pendente.
