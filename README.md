# Vetor Urbano

Plataforma web para visualizar ocorrências urbanas e registrar relatos georreferenciados na Região Metropolitana do Rio de Janeiro. O projeto começa com uma base pública compartilhada e evolui em etapas para apoiar respostas a incidentes urbanos.

O projeto nasce da experiência prática de Márcio em monitoramento, operações e gestão de incidentes. Também é seu projeto de formação em desenvolvimento Full-Stack com Java: decisões, código e documentação devem ser claros o bastante para que ele consiga explicar o sistema em um portfólio ou entrevista.

## Escopo atual

O primeiro resultado utilizável será o **mapa público com consulta e registro de ocorrências em ambiente local/de demonstração**. Visitantes poderão visualizar os relatos compartilhados e enviar um registro com localização e informações básicas; a abertura do envio na internet exige controles adicionais. Cada ocorrência precisa comunicar seu estado com clareza; um relato recém-enviado não deve parecer uma confirmação independente.

- A base pública é compartilhada. Relatos `REPORTED` aceitos pela API aparecerão com o aviso “não verificado”.
- O registro começará com clique e confirmação do ponto no mapa, manterá as seis categorias e quatro severidades do SQL inicial e identificará a gravidade como informada pelo relator. Descrição é opcional; a API atribuirá status e horário de recebimento.
- Organizações podem aparecer na interface como exemplos demonstrativos. Esses exemplos não representam contas, dados privados ou isolamento organizacional implementado.
- Alertas de proximidade são considerados com a aplicação aberta. O escopo não pressupõe acompanhamento quando ela está em segundo plano, push ou localização contínua armazenada no servidor.
- A delimitação territorial do MVP usa o envelope EPSG:4326 documentado na [especificação](docs/specs/SPEC-001-REQUIREMENTS.md). O envelope é um limite retangular; não equivale a validação de pertencimento aos limites oficiais de cada município.

Heatmaps, voto comunitário, moderação avançada, áreas de risco, roteamento, importação vetorial, organizações reais e autenticação operacional detalhada são possibilidades futuras, não entregas assumidas do primeiro fluxo público.

## Stack

| Camada    | Tecnologia                                         |
| --------- | -------------------------------------------------- |
| Web       | Angular; versão instalada atualmente: 22.2.0       |
| Mapa      | MapLibre GL JS                                     |
| Interface | Bootstrap como CSS e Angular CDK quando necessário |
| API       | Java 21+ e Spring Boot 3                           |
| Banco     | PostgreSQL 16 com PostGIS                          |
| Migrações | Flyway                                             |

O backend ainda não foi inicializado como aplicação. Existe apenas o arquivo SQL inicial V1, que o autor confirmou não ter executado. O escopo aprovado é reduzi-lo a ocorrências públicas e tipos necessários antes da primeira aplicação pelo Flyway em PostgreSQL/PostGIS. Nenhum contrato OpenAPI está versionado neste momento.

## Estado de verificação conhecido

O harness em `harness/verify.sh` procura `frontend/` e `backend/`, mas os módulos reais são `vetor-urbano-web/` e `vetor-urbano-api/`. O script também chama `lint` e `typecheck`, que não existem no `package.json` do frontend. Seu resultado positivo não valida os módulos do projeto.

Na verificação de 2026-09-24, `npx tsc --noEmit` passou; os dois testes Angular passaram, cobrindo criação do componente e título; e o build de desenvolvimento passou com aviso de depreciação do Sass. `npm run build` falhou porque o otimizador não conseguiu acessar Google Fonts (`EAI_AGAIN`). O orçamento do bundle de produção precisa ser reavaliado depois que esse bloqueio for resolvido. Ainda não há validação visual responsiva concluída nem testes do fluxo de ocorrências.

## Documentos

- [Requisitos e decisões de escopo](docs/specs/SPEC-001-REQUIREMENTS.md)
- [Arquitetura e roadmap](docs/architecture/Pipeline_Vetor_Urbano.md)
- [Análise da modelagem inicial](planejamento/MODELAGEM_DB_V1.md)
- [Diretrizes de colaboração com agentes](AGENTS.md)
- [Histórico de alterações](docs/PROJECT-LOG.md)

O trabalho de implementação é organizado em incrementos pequenos: mapear e registrar, persistir e consultar, integrar o mapa à API e, depois, avaliar alertas. Cada conversa de implementação deve explicar o fluxo entre frontend, API e banco e manter os documentos de acordo com o que foi entregue.
