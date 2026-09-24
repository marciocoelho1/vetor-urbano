# SPEC-001: Especificação Técnica e Arquitetural de Requisitos - Vetor Urbano

| Metadado | Detalhe |
| :--- | :--- |
| **Documento:** | SPEC-001-SRS (Software Requirements Specification) |
| **Projeto:** | Vetor Urbano |
| **Versão:** | 1.0.0 (`v0.1.0-alpha`) |
| **Autor:** | Márcio Coelho Elias Júnior (PO & Full-Cycle Engineer) |
| **Revisor:** | Antigravity AI Mentor (Software Architect) |
| **Status:** | Aprovado para Modelagem de Dados |

---

## 1. Contexto Estratégico & Engenharia de Domínio

O **Vetor Urbano** foi concebido para resolver um problema crítico enfrentado por centros de controle operacional, frotas corporativas e cidadãos em metrópoles: **a assimetria de informação durante incidentes críticos em vias públicas**.

Ao contrário de plataformas puramente colaborativas que sofrem com alertas obsoletos e ruído, o Vetor Urbano adota uma abordagem de **triagem corporativa com validação algorítmica e comunitária**, combinando:
1. Ingestão georreferenciada estruturada.
2. Moderação operacional B2B/B2G.
3. Difusão de alertas em tempo real com baixo consumo de recursos e preservação de privacidade.

### 1.1. Delimitação Geográfica do MVP (Região Metropolitana do Rio de Janeiro & Baixada)

Para garantir densidade estatística de dados, viabilidade operacional e validação de alta performance antes da escala nacional, o MVP do Vetor Urbano possui escopo geográfico estrito:
* **Município Polo:** Cidade do Rio de Janeiro (todas as zonas: Central, Sul, Norte, Oeste).
* **Baixada Fluminense:** Duque de Caxias, Nova Iguaçu, Belford Roxo, São João de Meriti, Nilópolis, Mesquita, Magé, Guapimirim, Queimados, Japeri, Paracambi, Seropédica e Itaguaí.
* **Envelope Cartográfico Bounding Box (PostGIS EPSG:4326):**
  $$\text{Bounding Box Envelope} = \text{ST\_MakeEnvelope}(-43.9000, -23.1000, -42.9500, -22.4500, 4326)$$
  * Longitude Mínima (Oeste): `-43.9000` (limites de Itaguaí/Paracambi)
  * Longitude Máxima (Leste): `-42.9500` (Baía de Guanabara / limites com Niterói e Magé)
  * Latitude Mínima (Sul): `-23.1000` (Orla marítima / Restinga da Marambaia)
  * Latitude Máxima (Norte): `-22.4500` (Serra / limites de Japeri e Guapimirim)

---

## 2. Regras de Negócio Fundamentais (RN)

* **RN-GEO01 (Restrição de Ingestão ao Bounding Box do MVP):** Toda tentativa de cadastro de incidente ou consulta fora das coordenadas do envelope da RMRJ deve ser rejeitada pela camada de validação da API com erro `422 Unprocessable Entity (GEO_OUT_OF_BOUNDS)`.
* **RN-MT01 (Ponderação Multivariada do Heatmap):** A intensidade da mancha térmica não é uma contagem cega de ocorrências. Cada ponto contribui com peso ponderado pela sua severidade (`CRITICAL` = 4x, `HIGH` = 3x, `MEDIUM` = 2x, `LOW` = 1x) multiplicado pelo fator de decaimento temporal ($e^{-\lambda \Delta t}$).
* **RN-MT02 (Filtro Categorial Exclusivo):** Ao ligar a mancha térmica, o usuário pode filtrar por categoria específica (ex: apenas "Alagamento", apenas "Confronto Armado" ou "Colisão Viária"). A mancha recalcula exclusivamente os pontos daquela classe.
* **RN-MT03 (Comportamento de Camada Cartográfica):** O usuário pode alternar entre: 1) Marcadores (Pins individuais); 2) Mancha Térmica (Heatmap puro); 3) Modo Adaptativo (Heatmap em visão macro de zoom out, com desdobramento em pins individuais a partir do nível de zoom $\ge 14$).
* **RN-AD01 (Classificação e Tipologia de Facções / Milícias):** Os polígonos de domínio territorial devem ser classificados compulsoriamente nas seguintes categorias padronizadas:
  * `COMANDO_VERMELHO` (CV - Vermelho)
  * `TERCEIRO_COMANDO_PURO` (TCP - Azul / Verde)
  * `AMIGOS_DOS_AMIGOS` (ADA - Amarelo / Laranja)
  * `MILICIA` (ML - Cinza / Preto)
  * `DISPUTA` (DISPUTE - Roxo / Hachurado dinâmico)
* **RN-AD02 (Governança e Carga Exclusiva):** A inclusão e alteração de polígonos territoriais de facções é estritamente restrita a perfis `OPERATOR` e `MANAGER` via pipeline de ingestão de dados abertos consolidados (formato XML/KML/GeoJSON). Cidadãos não podem desenhar ou editar polígonos territoriais.
* **RN-AD03 (Isenção Ética e Termo de Uso):** A exibição de áreas conflagradas visa exclusivamente à segurança física e corporativa preventiva, contendo aviso legal de caráter estatístico de segurança pública e respeito aos moradores das comunidades.
* **RN-AD04 (Integração Operacional com Risco e Roteamento):** Polígonos de áreas conflagradas ativas podem ser vinculados como multiplicadores de risco nas rotas de deslocamento (RF05) e disparadores de alerta de proximidade (RF03).

---

## 3. Parecer Técnico do Arquiteto & Refinamento de Requisitos

Abaixo, cada requisito levantado na fase de ideação de Produto é decomposto tecnicamente, apontando riscos arquiteturais, mitigações e especificações de engenharia.

### 2.1. Requisitos Funcionais Detalhados

#### RF01 – Registro Georreferenciado de Incidentes
* **Descrição Original:** Cadastro de incidentes informando coordenadas, data/hora, categoria e severidade.
* **Refinamento Arquitetural:**
  * **Sistema de Coordenadas:** Armazenamento em `EPSG:4326` (WGS84 geodésico) utilizando o tipo nativo PostGIS `geography(Point, 4326)` para cálculos precisos de distâncias em metros sem distorção cartográfica.
  * **Sanitização de Metadados de Mídia (LGPD & Segurança):** No upload de fotos comprobatórias, o backend deve **remover compulsoriamente os metadados EXIF** (que gravam modelo de câmera, número de série e coordenadas residenciais do autor).
  * **Categorização e Severidade:** Enumerações tipadas:
    * Categorias: `CRIME_VIOLENT`, `CRIME_PATRIMONIAL`, `TRAFFIC_COLLISION`, `FLOODING_CLIMATE`, `INFRASTRUCTURE_FAILURE`, `POLICE_OPERATION`.
    * Severidades: `LOW` (1), `MEDIUM` (2), `HIGH` (3), `CRITICAL` (4).
  * **Campos de Auditoria Obrigatórios:** `created_at`, `updated_at`, `source_type` (`CITIZEN_APP`, `OPERATOR_CONSOLE`, `API_PARTNER`).

#### RF02 – Visualização Cartográfica e Filtros Dinâmicos
* **Descrição Original:** Exibição de mapa interativo com marcadores, heatmaps e filtros de raio (1 a 5 km), horário e categoria.
* **Refinamento Arquitetural:**
  * **Indexação Espacial:** A coluna espacial `location` deve possuir índice do tipo `GiST` (`CREATE INDEX idx_incidents_location ON incidents USING GIST(location);`).
  * **Estratégia de Renderização:**
    * Para visão ampla (zoom out): O backend agrupa pontos via clustering espacial ou gera mapa de calor baseado em densidade pré-agrupada, evitando tráfego de milhares de pontos brutos no payload JSON.
    * Para visão próxima (zoom in): O cliente recebe GeoJSON e renderiza via WebGL (MapLibre GL JS) mantendo taxa de quadros estável ($\ge 30\text{ fps}$).
  * **Consulta Espacial Padrão:** Uso da função indexada `ST_DWithin`:
    ```sql
    SELECT id, category, severity, status, location
    FROM incidents
    WHERE ST_DWithin(location, ST_MakePoint(:longitude, :latitude)::geography, :radiusMeters)
      AND status = 'ACTIVE'
      AND created_at >= :startTime;
    ```

#### RF03 – Alertas Proativos por Cerca Virtual (Geofencing)
* **Descrição Original:** Notificações push disparadas quando usuários entram em perímetros ativos de risco.
* **Alerta Crítico do Arquiteto:**
  * *Risco:* Rastrear continuamente a localização GPS de dezenas de milhares de usuários no backend provocaria:
    1. Drenagem massiva da bateria dos aparelhos móveis.
    2. Sobrecarga exponencial no servidor ($O(N \times M)$ comparações contínuas de coordenadas).
    3. Violação de privacidade (LGPD), pois armazenaria o histórico de deslocamento dos usuários.
* **Solução Arquitetural Homologada: Spatial Pub/Sub com Células Hexagonais H3**
  * O território urbano é particionado em células hexagonais **Uber H3** (ex.: Resolução 8, raio de ~460 metros).
  * Cada incidente ativo gera um raio de impacto (buffer) que cobre um conjunto específico de índices H3.
  * O dispositivo do usuário monitora seu posicionamento **localmente no aparelho** e se inscreve nos tópicos de mensageria correspondentes à sua célula H3 atual e vizinhas imediatas (k-ring 1).
  * Quando um incidente grave é registrado, o backend publica a mensagem **apenas no canal Pub/Sub daquelas células H3**. Zero rastreamento de trajeto no banco de dados.

#### RF04 – Validação Comunitária e Algoritmo de Decaimento de Relevância
* **Descrição Original:** Votação de status pelos usuários ("Ainda acontecendo", "Via liberada", "Informação incorreta") com recálculo automático de relevância.
* **Refinamento Arquitetural:**
  * **Máquina de Estados Finita (FSM):**
    ```mermaid
    stateDiagram-v2
        [*] --> REPORTED: Cadastro pelo Cidadão
        REPORTED --> ACTIVE: >= 3 votos ou Validação por Operador
        REPORTED --> DISMISSED: >= 3 votos de "Informação Incorreta"
        ACTIVE --> COOLING_DOWN: Votos de "Via Liberada" ou Decaimento de Tempo
        COOLING_DOWN --> RESOLVED: Confirmação de Encerramento
        ACTIVE --> RESOLVED: Operador finaliza manualmente
        RESOLVED --> [*]
        DISMISSED --> [*]
    ```
  * **Fórmula de Decaimento Temporal com Meia-Vida (Half-Life Decay):**
    Um incidente não pode permanecer ativo eternamente. A pontuação de relevância $R(t)$ diminui exponencialmente com o tempo decorrido $\Delta t$:
    $$R(t) = \left( \text{BaseScore} + \sum w_i \cdot \text{Vote}_i \right) \times e^{-\lambda \cdot \Delta t}$$
    Onde $\lambda$ é calibrado por categoria (ex.: uma colisão veicular tem $\lambda$ alto com decaimento em 2 horas; um alagamento grave tem $\lambda$ baixo com persistência de 12 horas).
  * **Proteção Anti-Fraude (Sybil Attack):** Restrição de 1 voto por usuário autenticado por incidente, com rate limiting por IP/Device ID para denúncias anônimas.

#### RF05 – Roteamento Inteligente com Desvio de Risco
* **Descrição Original:** Recálculo de rotas sugerindo desvios automáticos quando o trajeto interceptar áreas de risco.
* **Estratégia de Fatiamento (Phased Delivery):**
  * *Fase 1 (MVP - Foco do Ciclo Atual):* **Verificador de Colisão Espacial de Rota**.
    O usuário envia a rota pretendida como uma `LineString` GeoJSON (obtida de qualquer serviço cartográfico ou traçado direto). O backend executa:
    ```sql
    SELECT i.id, i.category, i.severity, ST_AsGeoJSON(ST_Buffer(i.location::geography, i.risk_radius_meters)::geometry)
    FROM incidents i
    WHERE i.status = 'ACTIVE'
      AND ST_Intersects(i.location::geography, ST_Buffer(ST_GeomFromGeoJSON(:routeGeoJson)::geography, 50));
    ```
    Se houver intersecção, retorna as zonas de bloqueio e pontos alternativos de passagem (waypoint sugerido).
  * *Fase 2 (Evolução Futura):* Instância de roteador OpenStreetMap dedicado (OSRM / Valhalla) com penalização de arestas que cruzam polígonos de risco ativos (*avoidance polygons*).

#### RF06 – Controle de Acesso Baseado em Funções (RBAC)
* **Perfis do Sistema:**
  1. `ROLE_CITIZEN`: Leitura de incidentes públicos, registro de ocorrências comunitárias, votação de status.
  2. `ROLE_OPERATOR`: Todas as permissões de Cidadão + acesso à fila de moderação, aprovação/rejeição de incidentes, alteração manual de severidade e encerramento de ocorrências.
  3. `ROLE_MANAGER`: Todas as permissões de Operador + provisionamento e inativação de contas operacionais, acesso a métricas analíticas e auditoria de ações do sistema.

#### RF07 – Gestão de Operadores e Contas
* **Funcionalidades:** CRUD de usuários operacionais restrito a Gestores. Criação de convite com token temporário para definição de senha inicial, bloqueio preventivo de conta após 5 tentativas de login com falha, expiração forçada de credencial.

#### RF08 – Fila de Moderação em Tempo Real
* **Funcionalidades:** Visualização em tabela/grid Kanban para Operadores e Gestores contendo ocorrências com status `REPORTED` e `COOLING_DOWN`. Permite ordenar por gravidade, tempo de espera e proximidade com infraestruturas críticas.

#### RF09 – Mancha Térmica Dinâmica (Heatmap por Categoria)
* **Funcionalidades:** Alternância na interface entre a camada de marcadores pontuais (pins) e a camada de mancha térmica contínua (heatmap).
* **Parâmetros Dinâmicos:**
  * O usuário seleciona a categoria ativa (ex: `FLOODING_CLIMATE`, `CRIME_VIOLENT`, `TRAFFIC_COLLISION`).
  * A mancha térmica aplica pesos proporcionais à severidade de cada incidente e ao decaimento temporal ($w = \text{severity\_weight} \times e^{-\lambda \Delta t}$).
  * O gradiente cromático varia suavemente de azul/verde (baixa densidade de risco) para amarelo, laranja e vermelho escuro (alta concentração de risco).

#### RF10 – Camada Territorial de Áreas Conflagradas / Dominadas
* **Funcionalidades:** Sobreposição cartográfica de polígonos delimitadores de territórios sob influência de grupos armados (facções criminosas e milícias) no Rio de Janeiro e Baixada Fluminense.
* **Comportamento Visual e Interativo:**
  * Renderização de polígonos com preenchimento semitransparente e bordas distintas com codificação visual padrão (ex.: CV em vermelho, TCP em verde/azul, ADA em amarelo/laranja, Milícia em cinza escuro/preto, Disputa em hachurado).
  * Interação via clique/hover: exibição de balão informativo com nome da localidade/complexo, facção dominante registrada, nível de risco e data da última consolidação da inteligência geográfica.
  * Integração como barreira ou penalidade no cálculo de intersecção de rotas (RF05).

#### RF11 – Módulo de Ingestão de Dados Cartográficos Vetoriais (XML/KML/GeoJSON)
* **Funcionalidades:** Endpoint e ferramenta administrativa CLI/Web restrita a `OPERATOR` e `MANAGER` para upload e processamento em lote de bases abertas de polígonos (arquivos `.kml`, `.xml`, `.geojson` ou `.shp` da segurança pública do RJ).
* **Tratamento de Dados:**
  * Validação topológica de fechamento de anéis (`ST_IsValid`).
  * Conversão automática de coordenadas de origem para `EPSG:4326` (WGS84).
  * Simplificação de vértices via algoritmo Douglas-Peucker (`ST_SimplifyPreserveTopology`) para performance de renderização.

---

## 4. Requisitos Não-Funcionais Detalhados & Mecanismos de Garantia

### RNF01 – Latência em Consultas Espaciais ($\le 1,5\text{s}$)
* **Mecanismo:** Uso de índices `GiST` em PostGIS. Restrição de bounding box no SQL (`ST_MakeEnvelope`) para não carregar o mapa inteiro em memória. Caching HTTP com cabeçalhos `ETag` e `Cache-Control: public, max-age=15` para mapas de calor e marcadores agregados.

### RNF02 – Anonimização e Privacidade (LGPD & Zero Trust)
* **Mecanismo:**
  * Ocorrências anônimas **não salvam chave estrangeira para a tabela de usuários**.
  * Para rastreabilidade interna de trotes sem quebrar a privacidade, armazena-se um hash HMAC unidirecional com rotação periódica de salt (`reporter_fingerprint`).
  * Remoção de EXIF no backend antes de persistir imagens no sistema de arquivos ou bucket S3.

### RNF03 & RNF04 – Alta Disponibilidade (99,9%) e 20.000 Conexões Concorrentes
* **Mecanismo:** O modelo de threads bloqueantes do Spring MVC (Tomcat) satura com ~1.000 conexões ativas. Para sustentar 20.000 conexões sem consumo excessivo de memória:
  * Utilização de **Server-Sent Events (SSE) reativo via Spring WebFlux / Netty** ou integração com **Redis Pub/Sub** para transmissão de eventos push unidirecionais para os clientes.

### RNF05 – Desempenho Visual Cartográfico ($\ge 30\text{ fps}$)
* **Mecanismo:** Frontend utilizando biblioteca de mapas vetoriais acelerada por hardware WebGL (**MapLibre GL JS**), consumindo GeoJSON agrupado ou fatias vetoriais (Vector Tiles).

### RNF06 – Armazenamento Seguro de Credenciais
* **Mecanismo:** Criptografia das senhas com algoritmo **Argon2id** (configuração padrão: memória 64MB, 3 iterações, 1 thread de paralelismo), nativo do Spring Security Crypto.

### RNF07 – Gerenciamento de Sessão e Revogação Instantânea
* **Mecanismo:** Autenticação stateless baseada em **JWT (JSON Web Token)** assinado com chave assimétrica RSA ou HMAC-SHA256, com tempo de vida de 15 minutos. Para revogação imediata (logout ou banimento de operador), o token tem seu identificador único (`jti`) inserido em uma lista de bloqueio temporária no Redis com TTL igual ao tempo restante de vida do token.

### RNF08 – Autenticação Multifator (MFA) Mandatória para Gestores
* **Mecanismo:** Implementação do padrão **TOTP (Time-Based One-Time Password - RFC 6238)**. O Gestor escaneia um QRCode durante o primeiro acesso para vincular um aplicativo autenticador (Google Authenticator, Microsoft Authenticator, 1Password). O login só é completado após validação do código de 6 dígitos.

### RNF09 – Renderização GPU/WebGL de Heatmap e Alternância Imediata ($\le 250\text{ms}$)
* **Mecanismo:** A interpolação da mancha térmica deve ser executada inteiramente na GPU através de shaders da camada `heatmap` do MapLibre GL. A alternância entre a visão de pins e a visão térmica deve ocorrer em menos de 250ms sem congelamento da thread principal (Zero UI Freeze).

### RNF10 – Indexação e Simplificação Espacial de Polígonos Complexos
* **Mecanismo:** Polígonos de comunidades e favelas contendo milhares de vértices devem ser armazenados com índices espaciais `GiST` e versões simplificadas pré-computadas (`ST_SimplifyPreserveTopology(geom, 0.0001)`). Consultas de contenção (`ST_Contains`, `ST_Intersects`) devem responder em menos de $50\text{ms}$.

### RNF11 – Validação $O(1)$ de Limites Metropolitanos (Bounding Box)
* **Mecanismo:** Checagem de coordenadas geográficas na camada de borda/API em tempo constante $O(1)$ comparando latitude e longitude contra as constantes do Bounding Box da RMRJ antes de acionar a camada de banco de dados.

---

## 5. Matriz de Rastreabilidade de Engenharia

| Requisito | Camada Backend | Camada Banco de Dados | Camada Frontend | Mecanismo de Teste / Harness |
| :--- | :--- | :--- | :--- | :--- |
| **RF01** | `IncidentController`, `IncidentService` | `incidents` (`geography(Point)`) | Formulário com clique no mapa | Teste de unidade com asserção PostGIS |
| **RF02** | `SpatialQueryService` (`ST_DWithin`) | Índice `GiST(location)` | `MapLibre GL` com filtros | Teste de integração com Testcontainers |
| **RF03** | `H3SpatialService`, `EventStreamService` | Células H3 / Redis Pub/Sub | Ouvinte SSE/WebSocket | Simulação de broadcast de mensagens |
| **RF04** | `ValidationService`, `IncidentFSM` | `incident_votes`, FSM trigger | Botões de votação rápida | Teste de transição de estados |
| **RF05** | `RouteAnalysisService` (`ST_Intersects`) | `ST_Buffer`, `ST_Intersects` | Traçado de linha no mapa | Teste geométrico com polígonos mock |
| **RF06** | Spring Security `@PreAuthorize` | `users`, `roles`, `user_roles` | Guarda de rotas / RBAC UI | Teste de segurança HTTP 401/403 |
| **RF07** | `AdminUserController` | `users` com flags de status | Painel administrativo | Teste de fluxo de inativação |
| **RF08** | `ModerationQueueService` | View / Índice por status/severidade | Fila de atendimento Kanban | Teste de concorrência de moderação |
| **RF09** | `HeatmapDataService` (pesos + decaimento) | Query agregada ponderada | Camada `heatmap` WebGL | Teste de cálculo de peso térmico |
| **RF10** | `TerritoryZoneController` | `territory_zones` (`MultiPolygon`) | Camada poligonal colorida | Teste de consulta e serialização GeoJSON |
| **RF11** | `SpatialIngestionService` (XML/KML) | `ST_GeomFromKML`, `ST_Simplify` | Upload administrativo de arquivo | Teste de ingestão e validação topológica |

