# Vetor Urbano

Demonstração de mapa para consulta visual de ocorrências urbanas na Região Metropolitana do Rio de Janeiro, com evolução planejada para um fluxo público de relatos. A stack prevista é Angular, Java, PostgreSQL e PostGIS.

## Estado atual

O frontend Angular em `vetor-urbano-web/` oferece um mapa MapLibre, filtros, lista alternativa, visualização de densidade e formulário progressivo. **Todos os registros e pontos de interesse exibidos são sintéticos.** O formulário não envia dados, e a demonstração não possui integração com API, autenticação, persistência nem moderação.

O diretório `vetor-urbano-api/` ainda não contém uma aplicação Spring Boot ou endpoints. Há um rascunho SQL V1, que precisa ser revisado antes de qualquer aplicação em PostgreSQL/PostGIS. A especificação canônica do produto está em [`docs/specs/SPEC-001-REQUIREMENTS.md`](docs/specs/SPEC-001-REQUIREMENTS.md); ela define o fluxo futuro, mas não descreve funcionalidades já implementadas.

As categorias agrupadas no formulário demonstrativo não são o contrato das seis categorias da especificação. Relatos reais só poderão ser tratados quando o contrato da API e os controles definidos no projeto estiverem implementados. Não use os dados da demonstração para decisões operacionais ou de segurança.

A camada de territórios permanece indisponível: não foram incorporados polígonos sem origem, geometria e licença verificadas. A lista de municípios cobertos e os limites oficiais também não estão validados. Veja a [auditoria de fontes territoriais](docs/fontes-territoriais.md).

O mapa-base usa tiles OpenStreetMap, com atribuição visível, e depende de conexão e suporte a WebGL. O serviço de tiles é usado somente para demonstração de baixo volume; a operação pública exige avaliação de provedor e termos apropriados.

## Executar a demonstração

```bash
cd vetor-urbano-web
npm ci
npm start
```

A aplicação estará disponível em `http://localhost:4200/`.

## Verificações

Na pasta `vetor-urbano-web/`:

```bash
npm run lint
npm run typecheck
npm run test:ci
npm run build
```

O harness da raiz pode ser executado com `bash harness/verify.sh`. Os testes de unidade e o build não comprovam a integração com API/banco nem substituem a validação visual e de acessibilidade.

## Documentação do projeto

- [Requisitos e decisões de produto](docs/specs/SPEC-001-REQUIREMENTS.md)
- [Arquitetura e roadmap canônicos](docs/architecture/Pipeline_Vetor_Urbano.md)
- [Análise do esquema SQL inicial](planejamento/MODELAGEM_DB_V1.md)
- [Auditoria de fontes territoriais](docs/fontes-territoriais.md)
- [Histórico do projeto](docs/PROJECT-LOG.md)
- [Patch notes](PATCH_NOTES.md)

A aplicação demonstrativa é uma etapa de interface. O fluxo completo depende de contrato, API, migração revisada e testes em PostgreSQL/PostGIS real.
