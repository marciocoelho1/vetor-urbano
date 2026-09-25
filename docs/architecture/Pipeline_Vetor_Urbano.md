# Vetor Urbano — Arquitetura e roadmap do MVP

> **Estado do produto:** MVP em planejamento; consulta e registro de ocorrências ainda não funcionam ponta a ponta.
> **Estado do frontend:** shell Angular com navegação, mapa-base MapLibre e mensagens de carregamento/erro; sem pontos de ocorrência, filtros ou formulário.
> **Estado da API:** aplicação Spring Boot ainda não inicializada; não há `pom.xml` nem endpoints.
> **Estado do banco:** há um arquivo SQL V1 inicial; segundo o autor, ele ainda não foi executado em PostgreSQL/PostGIS.
> **Última vistoria documentada:** 2026-09-24.

## 1. Produto e recorte do MVP

O Vetor Urbano é um mapa público para consultar e registrar relatos de ocorrências urbanas georreferenciadas na Região Metropolitana do Rio de Janeiro. A motivação de domínio vem da experiência do autor com monitoramento, trânsito e contingência. O software também é seu projeto de formação em desenvolvimento Full-Stack com Java.

O primeiro resultado utilizável é o fluxo público básico:

1. abrir um mapa centrado na região coberta;
2. consultar ocorrências públicas;
3. selecionar e confirmar um ponto no mapa antes de registrar um relato;
4. comunicar claramente o estado do relato;
5. avaliar alertas de proximidade enquanto a aplicação estiver aberta.

A primeira entrega roda localmente para demonstração; “público” indica consulta e envio sem conta a uma base compartilhada, não publicação do serviço na internet. Relatos `REPORTED` aceitos pela API aparecem nessa base com o aviso “não verificado”. O relator escolherá uma das seis categorias do enum SQL inicial e uma das quatro severidades, exibida como “gravidade informada pelo relator”. Organizações só aparecem como exemplos fictícios identificados na interface. Nesta fase, não há contas de organização, ocorrências privadas nem isolamento multi-tenant. Antes dessa evolução, será necessário definir visibilidade, vínculo e autorização.

O envelope EPSG:4326 abaixo é um retângulo operacional, não uma representação de limites municipais:

    ST_MakeEnvelope(-43.9000, -23.1000, -42.9500, -22.4500, 4326)

Consulte a especificação funcional para prioridades e decisões abertas.

## 2. Stack e desenho simples

| Camada          | Tecnologia acordada                               | Uso no MVP                                                      |
| --------------- | ------------------------------------------------- | --------------------------------------------------------------- |
| Frontend        | Angular e TypeScript estrito                      | Mapa público, filtros e formulário                              |
| Mapa            | MapLibre GL JS                                    | Apresentar o mapa e as ocorrências                              |
| Interface       | Bootstrap para CSS; Angular CDK quando necessário | Grid e utilitários; comportamento complexo só quando necessário |
| API             | Java 21+ e Spring Boot 3                          | Validação, contrato HTTP e casos de uso                         |
| Dados espaciais | PostgreSQL 16 + PostGIS                           | Persistir pontos e consultar distância                          |
| Migrações       | Flyway                                            | Versionar alterações de esquema                                 |

O fluxo esperado é direto: componente Angular → serviço Angular → API REST → serviço Spring → repositório → PostgreSQL/PostGIS. O primeiro fluxo não exige microsserviços, arquitetura extensa, cache distribuído ou mensageria.

Os contratos devem ser publicados em OpenAPI 3.1. Use /api/v1/, rotas em kebab-case, JSON em camelCase, Problem Details da RFC 9457 e paginação Offset/Limit quando apropriado.

## 3. Fases e critérios de conclusão

Os estados abaixo descrevem o repositório visto em 2026-09-24. Uma fase não se torna concluída apenas por existir uma pasta, um documento ou um scaffold. As versões entre parênteses são marcos planejados, não versões já entregues.

### Fase A — Fundação do produto e requisitos (v0.1.0-alpha)

**Entregue como documentação:** escopo regional, requisitos iniciais e escolha de stack.
**Decidido:** publicar `REPORTED` com aviso “não verificado”, selecionar e confirmar o ponto por clique no mapa, manter as seis categorias do SQL inicial e deixar o relator escolher a gravidade, identificada como informação dele. Ponto, categoria e gravidade são obrigatórios; descrição é opcional; a API atribui status, origem e horário de recebimento. O primeiro MVP roda localmente.
**Pendente para exposição na internet:** definir prevenção de abuso e retirada de relatos indevidos.

### Fase B — Rascunho de modelagem espacial (v0.2.0-alpha)

**Existente:** script SQL inicial com usuários, funções, ocorrências, votos e zonas, além de PostGIS, índices e triggers.
**Ainda não realizado:** execução pelo Flyway, criação em instância PostgreSQL/PostGIS ou integração com API. O autor confirmou que V1 foi apenas escrita.
**Próxima ação:** revisar a V1 ainda não executada para conter somente ocorrências públicas e tipos necessários, preservando as seis categorias e quatro severidades. `planejamento/MODELAGEM_DB_V1.md` registra os pontos de atenção. Usuários, votos e zonas aguardam casos de uso próprios; depois de aplicada a V1 a uma base preservada, mudanças passam a exigir novas migrações.

### Fase C — Base cartográfica Angular (v0.3.0-alpha)

**Existente:** shell Angular, sidebar com acesso ao mapa público, mapa-base MapLibre e mensagens para carregamento e erro do mapa. A camada raster depende de um serviço externo; não há marcadores de ocorrência, filtros, formulário ou consumo de API.
**Verificações em 2026-09-24:** `npx tsc --noEmit` passou; dois testes Angular passaram, mas cobrem apenas a criação do componente e o título; o build de desenvolvimento passou com aviso de depreciação do Sass. `npm run build` falhou ao buscar Google Fonts (`EAI_AGAIN`), antes de comprovar o orçamento do bundle. Não há validação visual responsiva concluída. O harness procura `frontend/` e `backend/`, não os módulos reais, e ainda chama scripts `lint` e `typecheck` que não existem no `package.json`; seu sucesso não comprova as verificações.
**Conclusão desta fase:** mapa-base e estados de carregamento/erro verificados em navegador e nos tamanhos de tela previstos; compilação, build de produção e testes aplicáveis aprovados. Consulta de ocorrências e formulário pertencem às fases de integração posteriores.

### Fase D — Contrato e API do fluxo público (v0.4.0-alpha)

**Entregas:** aplicação Spring Boot simples, OpenAPI 3.1, migrações Flyway testadas em PostGIS, validação espacial e operações para consultar e registrar ocorrências públicas.
**Portão para o MVP local:** implementar validação no servidor, atribuição de status/horário/origem e o contrato já decidido para categoria, gravidade e ponto. Antes de expor envios na internet, definir controles contra abuso e retirada de relatos.
**Conclusão:** consulta e gravação funcionam com esquema aplicado, payloads e erros seguem o contrato e testes verificam limites geográficos, publicação e persistência.

### Fase E — Integração do mapa com a API (v0.5.0-alpha)

**Entregas:** mapa lendo API, clique para selecionar e confirmar ponto, formulário com seis categorias e quatro gravidades, envio de relatos, feedback de carregamento/erro/sucesso e aviso “não verificado” junto da gravidade informada pelo relator.
**Conclusão:** fluxo ponta a ponta reproduzível localmente, sem apresentar placeholders como dados reais.

### Fase F — Alertas durante o uso ativo (v0.6.0-alpha)

**Entregas condicionais:** após consentimento, consultar proximidade enquanto a aplicação está aberta; indicar falha ou ausência de permissão; não armazenar trajetos.
**Conclusão:** testes cobrem consentimento, falha de localização e casos dentro e fora do raio escolhido. O MVP não promete atualização com a página oculta.

### Fase G — Evolução operacional (versões posteriores)

Avaliar separadamente votação, moderação, heatmap, autenticação operacional e organizações reais. Definir quais políticas de dados, segregação e auditoria serão necessárias antes da implementação.

### Fase H — Operação e escala (quando justificadas)

Containers, automação de CI, observabilidade, análise de segurança e teste de carga devem acompanhar requisitos medidos. Redis, H3, WebFlux, SSE, WebSockets, 20.000 conexões e 99,9% de disponibilidade não são escolhas automáticas do MVP.

## 4. Próximos passos recomendados

A ordem abaixo mantém cada entrega pequena e explicável. As mudanças de código serão propostas e autorizadas em conversas próprias; este documento registra o caminho e os critérios para avaliar cada etapa.

1. **Usar as decisões fechadas como contrato do primeiro relato.** `docs/specs/SPEC-001-REQUIREMENTS.md` define publicação de `REPORTED` como “não verificado”, ponto confirmado no mapa, seis categorias, gravidade escolhida pelo relator, descrição opcional e status/horário/origem atribuídos pelo servidor. O primeiro MVP é local/de demonstração. A V1 ainda não foi executada e será reduzida ao fluxo público antes da primeira migração.
2. **Estabilizar a base web e a verificação.** Em um chat de frontend, revisar a dependência de Google Fonts no build de produção, medir o bundle após o build funcionar, tratar o aviso de Sass e validar o mapa em 375, 390, 768 e 1200 px. Em um chat de infraestrutura, corrigir `harness/verify.sh` para apontar para os módulos reais, executar comandos disponíveis e falhar quando um módulo esperado não for verificado. A etapa termina com comandos confiáveis e resultados registrados, sem confundir compilação com teste visual do mapa.
3. **Desenhar o contrato mínimo e adequar o esquema.** Definir em OpenAPI 3.1 os payloads e respostas de `GET /api/v1/incidents` e `POST /api/v1/incidents`, filtros e paginação da leitura, estados e erros Problem Details. Conferir `V1__Initial_Schema.sql` contra esse contrato. Como o arquivo ainda não foi executado, revisar diretamente a V1 para conter ocorrências públicas e tipos necessários, preservando os seis valores de categoria e quatro de severidade. Executar a migração pelo Flyway em PostgreSQL/PostGIS antes de declarar o banco pronto.
4. **Criar a API do fluxo público.** Inicializar `vetor-urbano-api/` com Spring Boot e implementar validação, gravação e consulta de ocorrências conforme o contrato. Verificar coordenadas válidas e inválidas, regra de visibilidade e persistência em banco. A API só está pronta quando os endpoints e a migração funcionarem juntos em ambiente local reproduzível.
5. **Conectar o mapa ao fluxo de ocorrências.** Em um chat de frontend, adicionar clique e confirmação do ponto, formulário com as seis categorias e quatro gravidades, marcadores e filtros definidos no contrato, com estados de vazio, carregamento, erro e sucesso. Conferir que um relato enviado e permitido pela regra de publicação pode ser consultado no mapa e que exemplos organizacionais continuam identificados como demonstração.
6. **Avaliar alertas com a aplicação aberta.** Depois do fluxo público completo, definir o raio e o modo de atualização; pedir permissão de localização e consultar ocorrências próximas sem armazenar trajetos. Testar permissão negada, localização indisponível e pontos dentro e fora do raio.

O contrato de produto do primeiro relato local está definido. A revisão da V1, o build e o harness podem avançar em chats de implementação separados. Expor o formulário na internet continua condicionado a controles contra abuso e a um caminho para retirar relatos indevidos.

## 5. Critério de engenharia por incremento

Toda implementação precisa explicar o caminho dos dados e como alguém verificará o resultado. Para cada incremento, registrar comportamento e usuário; entrada, validação e resposta; persistência necessária; estados de erro/vazio; e verificações do cenário normal e de um erro relevante.

Identificadores e código em inglês; documentação técnica e explicações em português. Manter os exemplos organizacionais claramente fictícios. Não registrar segredos, dados reais de incidentes ou relatos pessoais do autor no repositório.

## 6. Estrutura do monorepo

    Vetor Urbano/
    ├── vetor-urbano-web/       # Angular e MapLibre
    ├── vetor-urbano-api/       # Esquema inicial; aplicação API pendente
    ├── docs/
    │   ├── architecture/       # Arquitetura e roadmap: fonte canônica
    │   ├── specs/              # Requisitos do produto
    │   └── PROJECT-LOG.md      # Histórico das alterações
    ├── planejamento/           # Análise do esquema e decisões de modelagem
    ├── harness/                 # Verificação: revisar caminhos antes de confiar
    ├── AGENTS.md                # Acordos de colaboração e escopo
    └── README.md                # Visão executiva e estado verificado

Este é o único pipeline presente no repositório nesta vistoria. Links de outras conversas devem apontar para esta cópia canônica.
