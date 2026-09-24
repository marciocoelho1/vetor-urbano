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

---

## 2. Parecer Técnico do Arquiteto & Refinamento de Requisitos

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

---

## 3. Requisitos Não-Funcionais Detalhados & Mecanismos de Garantia

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

---

## 4. Matriz de Rastreabilidade de Engenharia

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
