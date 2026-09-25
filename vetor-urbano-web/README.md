# Vetor Urbano — frontend

Aplicação Angular do mapa público, cujo primeiro fluxo completo será demonstrado localmente. Hoje há um shell com navegação, mapa-base MapLibre e mensagens de carregamento e erro. A consulta de ocorrências, os filtros e o formulário ainda não foram implementados. O [pipeline do projeto](../docs/architecture/Pipeline_Vetor_Urbano.md) descreve o MVP e a ordem recomendada das próximas entregas.

## Executar localmente

Na pasta `vetor-urbano-web/`, com as dependências instaladas por `npm ci`:

```bash
npm start
```

Abra `http://localhost:4200/`. O mapa-base usa tiles de um serviço externo; sua visualização depende de conexão com esse serviço.

## Verificações disponíveis

```bash
npx tsc --noEmit
npm run test -- --watch=false
npx ng build --configuration development
npm run build
```

Em 2026-09-24, tipos e dois testes passaram. O build de desenvolvimento passou com aviso de depreciação do Sass. O build de produção falhou ao tentar acessar Google Fonts (`EAI_AGAIN`), portanto seu resultado ainda precisa ser validado após resolver a dependência de rede. A inspeção visual responsiva permanece pendente. Não há script de teste ponta a ponta configurado.
