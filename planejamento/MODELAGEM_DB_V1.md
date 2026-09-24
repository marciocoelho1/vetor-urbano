# Análise de Modelagem de Dados - Vetor Urbano (v0.2.0-alpha)

**Autor:** Antigravity AI (DBA / Software Architect)
**Data:** 2026-09-24
**Artefato SQL Gerado:** `vetor-urbano-api/src/main/resources/db/migration/V1__Initial_Schema.sql`

---

## 1. Decisões Arquiteturais e de Modelagem Aplicadas

A modelagem inicial (Migração Flyway V1) foi desenvolvida estritamente alinhada à matriz de requisitos (`SPEC-001`), focando em alta performance espacial e resiliência transacional:

* **PostGIS Geométrico vs Geográfico:**
  * **Incidentes (`location`):** Foi utilizado o tipo `GEOGRAPHY(Point, 4326)`. Essa escolha é mandatória para garantir cálculos de raio corretos (`ST_DWithin` em metros) sem necessitar de transformações de projeção em tempo de consulta (evitando o gargalo no *index scan*).
  * **Zonas Territoriais (`area_polygon`):** Foi adotado o tipo `GEOMETRY(MultiPolygon, 4326)`. Motivo: Polígonos de favelas podem ter milhares de vértices. A função de simplificação (`ST_SimplifyPreserveTopology`) e os cálculos complexos de interseção com rotas (LineString) são computacionalmente mais eficientes e robustos com R-Trees baseadas em `GEOMETRY` do que com `GEOGRAPHY`.
* **Segurança e Anti-Fraude (Sybil Attack):**
  * A tabela `incident_votes` recebeu índices parciais (Unique Constraints) garantindo que um mesmo `user_id` ou `voter_fingerprint` (HMAC anonimizado) não consiga inserir múltiplos votos para o mesmo incidente, protegendo a integridade da Máquina de Estados (RF04).
* **Auditoria Contínua:**
  * Implementada *Trigger* padrão no PostgreSQL (`update_updated_at_column()`) acoplada às principais entidades transacionais, garantindo a atualização cega e inviolável do campo `updated_at`, sem depender da aplicação (prevenindo falhas caso um update seja feito direto na base ou via console).

---

## 2. Feedback Analítico: Lacunas e Pontos de Atenção (Gaps)

Analisando a especificação e os objetivos da plataforma operacional corporativa, identifiquei **lacunas (gaps) reais de modelagem** que precisarão ser endereçadas na v0.2.1 ou nas camadas de serviço:

### 2.1. Auditoria Incompleta para RBAC (Falta Rastreabilidade Ativa)
Atualmente registramos *quando* o dado mudou (`updated_at`), mas para um sistema B2G/Segurança Pública com perfis `OPERATOR` e `MANAGER`, é crítico saber **QUEM** mudou o status do incidente ou encerrou a ocorrência (RF08).
> **Solução Recomendada:** Adicionar campos `created_by` e `updated_by` (UUID apontando para `users`) nas tabelas `incidents` e `territory_zones`. 

### 2.2. Polígonos Simplificados sem Automação de Banco
No RNF10, exigimos que o polígono seja indexado e simplificado (`simplified_polygon`) para agilizar as análises de intersecção com roteamento. Na modelagem atual, delegamos a responsabilidade de calcular o polígono simplificado para o backend/ETL.
> **Solução Recomendada:** Podemos criar uma *Trigger* `BEFORE INSERT OR UPDATE ON territory_zones` que chama o `ST_SimplifyPreserveTopology(NEW.area_polygon, 0.0001)` automaticamente caso ele venha vazio, garantindo que nenhum dado passe sem a versão leve de renderização e garantindo integridade.

### 2.3. Particionamento e Retenção de Dados (Data Lifespan)
Incidentes resolvidos/descartados vão crescer exponencialmente (especialmente para RMRJ). Consultas sobre eventos ativos sofrerão degradação (mesmo com os índices compostos que criei em `status, created_at`) ao passarmos de milhões de registros.
> **Solução Recomendada:** Para as próximas etapas (v0.3.0), considerar o **particionamento nativo do PostgreSQL** na tabela `incidents` baseado na coluna `created_at` (Partições Mensais) ou separar dados puramente históricos em uma tabela `incidents_archive`.

### 2.4. Constraints de Enumeração x Extensibilidade
Usamos `ENUM` nativo do PostgreSQL para `incident_category` e `faction_type`. Essa abordagem garante segurança de tipo rigorosa e baixo uso de disco. No entanto, adicionar uma nova facção requer um `ALTER TYPE ... ADD VALUE`, o que em bases massivas pode requerer travas estruturais de curtíssima duração. Para a escala metropolitana proposta, isso não será um bloqueador no curto prazo.

---

## Próximos Passos (Action Items)

1. **Revisão:** Avaliar as lacunas apontadas (principalmente a adição de `updated_by`). Posso ajustar o DDL imediatamente caso concorde.
2. **Execução:** O arquivo inicial foi provisionado em `src/main/resources/db/migration/V1__Initial_Schema.sql`. O repositório já está aderente ao Flyway.
3. **Evolução:** Iniciar a fase de UX/UI ou Setup do Spring Boot (Backend) conforme a esteira.
