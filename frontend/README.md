# Frontend do Vetor Urbano

Demonstração Angular + SCSS em `frontend/`, mantida na branch `main`. Ocorrências/POIs são sintéticos; importações manuais ficam na aba. Cadastro não envia dados. Não existe API, autenticação, moderação real ou persistência no servidor.

## Execução local

Na raiz do repositório:

```bash
cd frontend
npm ci
npm start
```

Abra `http://localhost:4200/`. Os mapas atuais usam MapLibre/Alidade Bright personalizado e Leaflet/Alidade Bright raster como recuperação. Rede é necessária; outros hosts exigem configuração autorizada do provedor. O lockfile fixa as dependências usadas; não atualizar versões como parte da instalação.

## Verificação

Na raiz:

```bash
bash harness.sh frontend
```

Na pasta `frontend/`, para a matriz Firefox/Chromium:

```bash
npx playwright install firefox chromium
npm run test:e2e -- --workers=1
```

O harness executa lint, testes de unidade e build de produção. Playwright verifica fluxos, falhas do mapa, teclado, lista alternativa e telas estreitas; alguns cenários dependem de tiles reais. As saídas em `dist/`, `test-results/` e caches são locais e ignoradas pelo Git. Testes ausentes não devem ser tratados como sucesso.

## Organização e limites

`src/app/` contém a interface, domínio demonstrativo, fixtures e módulos carregados sob demanda. `public/maps/` contém configuração cartográfica, territórios demonstrativos, estilo e pins; licenças ficam em `public/licenses/`. Nenhum código ou dependência do vídeo integra o frontend.

Estado, evidências e gates: [PLAN.md](../PLAN.md). Requisitos atuais: [escopo](../docs/escopo.md); decisões técnicas: [arquitetura](../docs/arquitetura.md). A estrutura anterior `vetor-urbano-web/` foi consolidada aqui. Leitor de tela, aparelho físico e backend/PostGIS continuam pendentes.
