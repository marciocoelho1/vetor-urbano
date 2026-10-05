# Vetor Urbano — aplicação web

Aplicação Angular da demonstração de consulta geográfica. O mapa usa MapLibre; ocorrências e pontos de interesse são dados sintéticos. Os três grupos de categoria do formulário servem à demonstração visual e não substituem o contrato das seis categorias em `docs/specs/SPEC-001-REQUIREMENTS.md`.

A interface inclui filtros, alternativa em lista, visualização de densidade e formulário progressivo. Não há chamadas à API nem envio, autenticação, persistência ou moderação. O mapa-base OpenStreetMap depende de rede e WebGL; o worker MapLibre é publicado como asset local do build.

## Executar localmente

```bash
npm ci
npm start
```

Abra `http://localhost:4200/`.

## Verificações

```bash
npm run lint
npm run typecheck
npm run test:ci
npm run build
```

Use `bash harness/verify.sh` na raiz para executar os checks do monorepo. Os testes de frontend não validam a API ou a persistência espacial, que ainda não estão implementadas.
