# SPEC-001 — Requisitos do Vetor Urbano

| Campo                   | Valor                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| Documento               | Especificação funcional e técnica                                                                         |
| Versão da especificação | 1.3                                                                                                       |
| Estado                  | Regras do primeiro fluxo local aprovadas; condições de publicação externa e evoluções identificadas abaixo |
| Produto                 | Vetor Urbano                                                                                              |
| Região inicial          | Região Metropolitana do Rio de Janeiro e municípios indicados pelo produto                                |

Esta especificação registra escopo, decisões aprovadas e trabalho futuro. Uma decisão desejada ou uma linha em “Evolução” não significa que a funcionalidade já esteja implementada.

## 1. Objetivo e contexto

O Vetor Urbano apresenta um mapa público para consulta de ocorrências e permite registrar relatos georreferenciados. O problema de domínio vem da experiência do autor em monitoramento e gestão operacional. O projeto também é um projeto de formação: a solução deve ser explicável por alguém que está aprendendo desenvolvimento Full-Stack com Java, Angular e banco relacional.

## 2. Escopo aprovado para o primeiro MVP

- Aplicação web em Angular com MapLibre GL JS. A primeira entrega roda em ambiente local/de demonstração; “público” descreve a consulta e o envio sem conta em uma base compartilhada, não um lançamento na internet.
- Mapa público centrado na Região Metropolitana do Rio de Janeiro.
- Base única de ocorrências públicas, compartilhada por quem consulta o mapa.
- Registro e consulta das informações essenciais de ocorrência, com ponto WGS84 confirmado, uma das seis categorias aprovadas, severidade escolhida pelo relator e descrição textual opcional. A API atribui o horário de recebimento, o status inicial e a origem do envio; o usuário não informa esses campos.
- Relatos `REPORTED` aparecem na base pública compartilhada assim que forem aceitos pela API, sempre identificados como “não verificados”. A severidade deve aparecer como “gravidade informada pelo relator”; nem ela nem a categoria equivalem a confirmação independente.
- Alertas de proximidade, quando implementados, dependem de permissão e funcionam somente enquanto a aplicação estiver aberta e visível.
- Organizações podem ser apresentadas como exemplos claramente identificados. No MVP, não há organizações reais, dados privados por organização, autenticação organizacional ou isolamento multi-tenant.
- Frontend e API permanecem módulos separados no mesmo repositório. API: Java 21+ e Spring Boot 3. Persistência: PostgreSQL 16, PostGIS e Flyway.

### Fora do MVP

Não são pré-requisitos do primeiro fluxo público:

- organizações reais, espaços privados ou autorização multi-tenant;
- uso do GPS em segundo plano, notificações push ou armazenamento de trajetos;
- Redis, H3, WebSockets, uma arquitetura de microsserviços ou um gateway distribuído;
- heatmap, votação comunitária e algoritmo de decaimento temporal;
- roteamento automático e sugestões de desvios;
- camadas de territórios de grupos armados e importação de dados vetoriais;
- gestão completa de usuários, refresh tokens, blocklist de JWT, MFA ou painel de gestores;
- metas de 20.000 conexões, 99,9% de disponibilidade, latência específica ou desempenho gráfico sem ambiente e protocolo de medição.

Esses itens podem ser priorizados em versões futuras, com justificativa, critérios de aceite e decisões de produto próprios.

## 3. Premissas geográficas

O MVP usa coordenadas WGS84 (EPSG:4326) no formato longitude e latitude. Para validar o envelope metropolitano, utiliza:

```sql
ST_MakeEnvelope(-43.9000, -23.1000, -42.9500, -22.4500, 4326)
```

Esse envelope é um retângulo operacional para limitar pontos e consultas. Ele não representa os limites municipais oficiais. Caso a regra passe a exigir pertencimento municipal, será necessário definir e manter os polígonos de municípios separadamente.

## 4. Requisitos funcionais e prioridade

| ID   | Requisito                                                                                                                                                                               | Prioridade                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| RF01 | Registrar ocorrência com ponto escolhido e confirmado no mapa, categoria entre as seis aprovadas, severidade, instante do relato e descrição opcional em texto. A API faz a validação final. | MVP |
| RF02 | Consultar e exibir ocorrências públicas em um mapa MapLibre, permitindo ao menos filtros simples por categoria, status e período.                                                       | MVP                                                         |
| RF03 | Oferecer alertas de proximidade após consentimento, apenas com a aplicação aberta. A posição atual é usada para a consulta e não é mantida como histórico de deslocamento.              | MVP a validar após o fluxo básico                           |
| RF04 | Votar na validade de uma ocorrência, mudar estados por contagem de votos e aplicar decaimento temporal.                                                                                 | Futuro                                                      |
| RF05 | Verificar interseções entre rotas e incidentes e recomendar desvios.                                                                                                                    | Futuro                                                      |
| RF06 | Controlar acesso de cidadão, operador e gestor para recursos autenticados.                                                                                                              | Futuro; definir necessidade de autenticação para cada fluxo |
| RF07 | Gerenciar contas operacionais e convites.                                                                                                                                               | Futuro                                                      |
| RF08 | Moderar relatos em uma fila operacional. `REPORTED` já pode aparecer sem validação prévia, sempre identificado como não verificado; a política de revisão e retirada pertence a uma etapa posterior. | Futuro; necessário antes de abrir envios na internet |
| RF09 | Gerar heatmap ponderado por categoria, severidade e tempo.                                                                                                                              | Futuro                                                      |
| RF10 | Exibir polígonos de áreas de risco com origem, data de atualização e aviso de incerteza.                                                                                                | Futuro; exige governança de dados                           |
| RF11 | Importar e validar arquivos geoespaciais por fluxo administrativo controlado.                                                                                                           | Futuro                                                      |

### 4.1. Estados e visibilidade dos relatos

**Decisão aprovada:** depois que a API aceitar e persistir um relato, seu status inicial `REPORTED` poderá ser consultado na base pública compartilhada. O mapa e os detalhes devem exibir “não verificado” de forma visível; categoria e severidade informadas no relato não tornam o evento confirmado. Se a API rejeitar o envio, o relato não aparece no mapa. A validação humana prévia não é requisito deste primeiro fluxo.

O rascunho SQL também define `ACTIVE`, `COOLING_DOWN`, `RESOLVED` e `DISMISSED`, mas a transição e a autoridade para alterar esses estados ainda não foram aprovadas para o primeiro fluxo. A API deve preservar status e horário de recebimento; não inferir verificação a partir da gravidade escolhida, de votos ausentes ou da origem.

### 4.2. Localização e categorias do primeiro formulário

**Seleção do ponto:** a pessoa clica no mapa, vê o ponto selecionado e confirma a localização antes de enviar o relato. O primeiro fluxo não depende de busca por endereço. A API continua responsável por validar coordenadas WGS84, ordem longitude/latitude e limite territorial.

**Categorias aprovadas:** manter os seis valores do enum `incident_category` em `V1__Initial_Schema.sql`: `CRIME_VIOLENT`, `CRIME_PATRIMONIAL`, `TRAFFIC_COLLISION`, `FLOODING_CLIMATE`, `INFRASTRUCTURE_FAILURE` e `POLICE_OPERATION`. A interface deve mostrar rótulos legíveis em português, mantendo os identificadores técnicos no contrato e no banco. O texto final dos rótulos pode ser revisto quando o formulário for desenhado.

**Campos do envio:** ponto confirmado, categoria e severidade são obrigatórios; descrição em texto é opcional. O relator escolhe `LOW`, `MEDIUM`, `HIGH` ou `CRITICAL`; a interface deve identificar essa gravidade como informada por ele. O servidor atribui `REPORTED` e o horário de recebimento; a ocorrência do evento pode ter acontecido antes desse horário. A origem do envio é definida pelo servidor, sem confiar em um valor enviado pelo cliente.

## 5. Requisitos não funcionais

- **RNF01 — Validação geográfica:** rejeitar coordenadas não numéricas, não finitas ou fora do envelope, com resposta de erro compreensível.
- **RNF02 — Integridade espacial:** armazenar pontos em `GEOGRAPHY(Point, 4326)`; usar uma consulta espacial indexável em consultas por raio.
- **RNF03 — Segurança de entrada:** validar tamanho, enumerações e formato no servidor. Tratar a descrição como texto, não como HTML fornecido pelo cliente.
- **RNF04 — Privacidade de localização:** solicitar localização apenas com consentimento para a função escolhida; não persistir trajetos. O MVP não promete rastreamento em segundo plano.
- **RNF05 — Comunicação de estado:** identificar `REPORTED` publicado como “não verificado” e a severidade como informada pelo relator; distinguir recebimento, verificação e encerramento quando esses estados existirem no fluxo.
- **RNF06 — Contrato HTTP:** versionar a API em `/api/v1/`, usar URIs em `kebab-case`, JSON em `camelCase` e documentar operações em OpenAPI 3.1 antes de conectar o fluxo ponta a ponta.
- **RNF07 — Erros:** padronizar respostas como Problem Details pela RFC 9457, sucessora da RFC 7807 citada em materiais anteriores.
- **RNF08 — Paginação:** quando necessária, utilizar Offset/Limit com limites máximos validados pelo servidor.
- **RNF09 — Explicabilidade:** priorizar fluxo direto entre componente, serviço, controller, serviço de domínio, repositório e banco; introduzir abstrações adicionais quando resolverem uma necessidade identificável.
- **RNF10 — Critérios mensuráveis:** desempenho e disponibilidade só viram metas depois de definir ambiente, dados de teste, concorrência, percentil e procedimento de medição.

## 6. Representação futura das organizações

Organizações exibidas no MVP são dados de demonstração e precisam ser apresentadas como tal. Não autorize esses exemplos a filtrar, particionar, possuir ou compartilhar ocorrências em nome de organizações reais.

Antes de criar tabelas, claims de token ou filtros por organização, definir:

- se ocorrências organizacionais são privadas ou podem ser publicadas na base compartilhada;
- se uma pessoa pode pertencer a várias organizações e quem administra esses vínculos;
- se o isolamento será aplicado a cada operação e consulta da API;
- como tratar publicações, cópias e histórico sem expor informações privadas.

## 7. Rastreabilidade do primeiro fluxo

| Resultado verificável       | Frontend                              | API                                                            | Banco                                    | Critério de aceite                                                                        |
| --------------------------- | ------------------------------------- | -------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| Consultar o mapa público    | Mapa e filtros básicos                | Contrato OpenAPI e consulta paginada de ocorrências            | Flyway e consulta PostGIS no envelope    | Pontos retornam com coordenadas e estado coerentes com o contrato                         |
| Registrar relato            | Formulário associado à coordenada     | Validação, erro Problem Details e regra de publicação acordada | Persistência de `GEOGRAPHY(Point, 4326)` | Coordenada inválida é rejeitada; uma válida pode ser consultada conforme sua visibilidade |
| Alertar com a página aberta | Consentimento e estado de localização | Consulta de ocorrências próximas                               | Consulta espacial indexada               | Sem consentimento não há leitura da posição; nenhum histórico de trajeto é persistido     |

## 8. Decisões abertas antes das features correspondentes

1. Antes de abrir o envio na internet, definir prevenção de abuso, revisão e retirada de relatos indevidos. O primeiro MVP permanece local/de demonstração e já exige validação de entrada na API.
2. No chat de banco, revisar a V1 não executada para conter somente ocorrências públicas e tipos necessários, preservando as seis categorias e quatro severidades; tabelas de usuários, votos e zonas ficam para futuras migrações.
3. Reavaliar necessidades organizacionais antes de implementar isolamento multi-tenant.
4. Adiar números de latência, disponibilidade e conexões até haver medições reproduzíveis.
