# Análise da modelagem inicial — Vetor Urbano

**Artefato examinado:** vetor-urbano-api/src/main/resources/db/migration/V1__Initial_Schema.sql
**Estado desta análise:** revisão estática; o autor confirmou que V1 foi apenas escrita, sem execução em PostgreSQL/PostGIS ou pelo Flyway.
**Escopo considerado:** primeiro fluxo público, com organizações como exemplos demonstrativos.

## 1. Conteúdo encontrado

O rascunho cria PostGIS, tipos enumerados e tabelas de usuários, funções, associações, ocorrências, votos e zonas territoriais. Define ponto de incidente em GEOGRAPHY(Point, 4326), polígonos em GEOMETRY(MultiPolygon, 4326), índices GiST, uma constraint retangular para coordenadas e triggers de atualização e simplificação.

A presença do script no repositório não comprova sua execução, compatibilidade com o Flyway ou conexão a uma API.

## 2. Ajuste ao escopo do MVP

O fluxo inicial usa ocorrências públicas e compartilhadas em ambiente local/de demonstração. Foi aprovado reduzir a V1, ainda não executada, a ocorrências públicas e tipos necessários. Contas de usuários, funções, votos comunitários, zonas, isolamento multi-tenant e a FSM completa aguardam casos de uso próprios.

Antes da API consumir V1:

1. conferir os campos exigidos pelo contrato inicial;
2. preservar as seis categorias e quatro severidades do rascunho, com gravidade escolhida pelo relator e apresentada como não verificada;
3. revisar a V1, ainda não executada, removendo tabelas e tipos sem uso no primeiro fluxo;
4. executar a migração pelo Flyway em PostgreSQL 16 com PostGIS e registrar o esquema aplicado.

Depois que uma V1 for aplicada a uma base que será preservada, não reescrevê-la: registrar alterações em migrações novas.

As seis categorias de `incident_category` e quatro severidades de `incident_severity` foram mantidas. Ponto, categoria e gravidade escolhida pelo relator são dados obrigatórios; descrição é opcional. O servidor atribui `REPORTED` e o horário de recebimento. A futura implementação da API decidirá quais colunas auxiliares realmente precisam permanecer na V1 reduzida, sem inserir tabelas de usuários, votos ou zonas por antecipação.

## 3. Pontos para resolver antes da implementação correspondente

### 3.1. Publicação e confiança

**Decisão aprovada:** um relato `REPORTED` aceito pela API aparece na base pública com o rótulo “não verificado”. Isso exige que a consulta pública retorne o status e que o mapa não apresente categoria ou severidade informadas como confirmação. Para o MVP local, validar entradas e usar dados de demonstração; antes de expor a gravação na internet, definir controles de abuso e um caminho para retirar relatos indevidos.

### 3.2. Coordenadas e cobertura

A constraint espacial limita pontos ao retângulo EPSG:4326, não aos polígonos oficiais de cada município. A pessoa selecionará e confirmará o ponto com um clique no mapa. A aplicação e o servidor devem documentar longitude e latitude, sua ordem e validar coordenadas finitas antes de persistir.

### 3.3. Raio de risco

risk_radius_meters tem valor padrão, mas admite nulo ou valor negativo. Validar no servidor e adicionar uma constraint de domínio antes de confiar nesse valor em uma consulta espacial.

### 3.4. Integridade de voto

Os dois índices únicos parciais evitam repetição quando user_id ou voter_fingerprint está preenchido. O esquema ainda permite ambos vazios e não proíbe os dois preenchidos. Antes dos votos, escolher a regra e impor que cada linha a satisfaça.

### 3.5. Auditoria

As triggers atualizam updated_at; não preservam histórico de decisões. incidents tem updated_by opcional, mas não created_by. Isso não é auditoria completa de quem criou ou decidiu cada ocorrência.

### 3.6. Geometria simplificada

simplified_polygon pode ser fornecido diretamente e a trigger não recalcula em toda alteração possível. Como area_polygon usa SRID 4326, a tolerância fixa 0.0001 tem unidade de grau e distância física que varia com a latitude. Usar simplificação apenas para apresentação, após definir e validar tolerância. Não usar a cópia simplificada para decisões de risco nas bordas dos polígonos.

### 3.7. Privacidade

HMAC, ausência de chave estrangeira e remoção de EXIF não demonstram anonimização do fluxo completo. O MVP não armazena trajetos. Definir dados exibidos, retenção e tratamento de logs antes de afirmar que relatos são anônimos.

### 3.8. Particionamento

Não há evidência de volume que justifique particionamento ou arquivamento neste momento. Introduzir quando métricas de tamanho e consulta mostrarem necessidade. Começar com recorte geográfico, temporal e paginação adequada.

## 4. Verificação necessária da migração

Na inicialização da API, verificar em banco real:

- PostgreSQL 16, PostGIS e execução pelo Flyway;
- rejeição de pontos inválidos ou fora do limite aprovado;
- consulta por distância em metros e uso do índice esperado;
- relações, status e atualização coerentes com o contrato;
- criação reproduzível do esquema em uma base vazia.

Este relatório recomenda revisões; não altera automaticamente o arquivo SQL.
