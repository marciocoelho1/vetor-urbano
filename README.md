# Vetor Urbano

Aplicação demonstrativa para consulta e análise geográfica de ocorrências, com evolução possível para colaboração e alertas. Stack planejada: **Angular + SCSS, Java e PostgreSQL/PostGIS**.

## Estado implementado

Existe uma **demonstração frontend Angular** em `frontend/`, derivada da identidade visual dos anexos: navegação entre mapa e cadastro, filtros acumuláveis, busca de ocorrências e áreas, painel recolhível, mapa ampliado, formulário progressivo por categoria, lista alternativa e camadas de densidade separadas. O protótipo também apresenta histórico/informes ativos, dashboard, reprodução temporal, comparação, filtros salvos, triagem manual de referências e exportação XLSX.

O filtro de raio fica dentro do mapa: inicia em 100 m, pode ser ajustado pelo slider ou pelo scroll do mouse até 5.000 m e aparece como polígono roxo-claro `#C4B5FD` com preenchimento transparente. O cálculo é local e aproximado. Períodos usam calendário e hora de Brasília; datas/horários personalizados ficam no filtro por período.

O centro inicial dos mapas e do filtro por raio é a Central do Brasil, nas coordenadas GeoJSON `[longitude, latitude]` `[-43.19156448029434, -22.903318808380494]`. Em **Registrar ocorrência**, o mapa fica embutido em **Indique o local** para Trânsito, Segurança e Contingência; clicar/toque preenche longitude e latitude, que também podem ser digitadas.

Em **Resultados visíveis**, cada registro pode abrir/fechar seus detalhes no próprio item. Até cinco painéis podem permanecer abertos; ao mudar filtros, detalhes que deixam de estar visíveis são fechados.

A exportação XLSX usa rótulos e valores de apresentação pt-BR, horários de Brasília, colunas com larguras explícitas, cabeçalhos formatados/fixos, filtros de planilha e ajuste de impressão em paisagem.

Arquivos CSV agregados e GeoJSON de eventos podem ser importados manualmente após informar origem, URL, licença/autorização, data de referência e limitações. O conteúdo é processado na aba atual e descartado ao atualizá-la/fechá-la. Nenhum arquivo é enviado; não há conexão automática com ISP-RJ, Fogo Cruzado, OTT, COR ou jornais. Estatísticas agregadas permanecem separadas de eventos geolocalizados. Registros sintéticos seguem identificados; polígonos territoriais são camada estática atribuída à fonte e com ressalvas explícitas.

Ainda **não existe backend Java executável, API, autenticação, persistência PostgreSQL/PostGIS ou fluxo real de moderação**. O botão valida o cadastro demonstrativo, mas não envia dados. Não publicar nem usar a interface para decisões de segurança.

O renderizador principal é **MapLibre** com o estilo vetorial Bright da instância pública OpenFreeMap, baseada em dados OpenStreetMap; a atribuição permanece visível. Quando WebGL2 não está disponível, o JavaScript/CSS do MapLibre não é carregado: um mapa 2D **Leaflet** é carregado sob demanda com tiles raster configurados em `frontend/public/maps/raster-provider.json` (o padrão é OpenStreetMap). O fallback preserva pontos, popups, heat layers separados, raio e polígonos selecionados; os tiles continuam dependendo de rede e de um serviço externo sem SLA. A configuração de tiles e atribuição pode ser trocada como asset estático, sem recompilar o JavaScript. A lista permanece acessível se os dois mapas falharem. A camada territorial está em `frontend/public/maps/areas-territoriais.geojson`; sua origem, data-base e limites estão em `docs/fontes-territoriais.md`.

O recorte territorial solicitado é a cidade do Rio de Janeiro e a Baixada Fluminense. A lista de municípios e os limites ainda não foram definidos; não declarar cobertura completa.

## Organização existente

| Caminho | Finalidade |
|---|---|
| `AGENTS.md` | Regras estáveis de colaboração, segurança e verificação |
| `PLAN.md` | Estado real, evidências, marcos e único detalhamento da próxima tarefa |
| `PATCH_NOTES.md` | Alterações desta entrega, verificações e pendências conhecidas |
| `docs/escopo.md` | MVP, RF/RNF classificados, regras a validar e aceites |
| `docs/arquitetura.md` | Alternativas, modelo mínimo, contrato HTTP preliminar e limitações |
| `docs/skills-externas.md` | Comparação de repositórios, seleção, licenças e ativação das skills locais |
| `docs/implementacao-2026-10.md` | Requisitos e contrato planejados para a evolução full-stack |
| `docs/fontes-territoriais.md` | Auditoria das fontes, comparabilidade, licença e limites de uso |
| `docs/referencias/contextoInicial.md` | Requisitos funcionais e não funcionais de origem |
| `docs/referencias/ui/` | HTML/SCSS originais preservados |
| `.hermes/skills/` | Skills selecionadas e restritas a este projeto |
| `harness.sh` | Convenção local de verificações, executada explicitamente |
| `.gitignore` | Exclusão de segredos e artefatos locais de build |

`frontend/` contém o protótipo Angular. `backend/` ainda não tem uma aplicação executável. Não foram criados diretórios vazios de decisão para escolhas não aprovadas.

## Executar a demonstração

Executar na raiz da pasta:

```bash
cd frontend
npm ci
npm start
```

Para verificações do frontend, na pasta `frontend/`:

```bash
npm run lint
npm run test:ci
npm run build
```

Para QA de navegador real (Playwright), instalar os navegadores uma vez e executar a matriz Firefox/Chromium:

```bash
npx playwright install firefox chromium
npm run test:e2e
```

Os testes E2E iniciam o servidor Angular local e exercitam MapLibre/WebGL2, o fallback Leaflet no Firefox com WebGL2 desativado (tiles simulados para repetibilidade), filtros/raio/territórios, mapa inline de cadastro, detalhes, teclado e larguras de 390/320 px. Capturas, traces e downloads ficam em `frontend/test-results/`, excluídos do Git.

- O mapa principal depende de WebGL2. Sem WebGL2, o fallback 2D busca tiles raster pela configuração estática; ambos dependem de rede/provedor. Em Firefox 157 headless com WebGL2 desativado, o smoke test separado recebeu tiles reais HTTP 200, verificou atribuição e selecionou coordenadas no mapa de cadastro. Se ambos os renderizadores falharem, lista e filtros continuam acessíveis. O raio usa centro selecionável/digitável e é uma estimativa local.
- Os exemplos de formulário não são enviados. Sem API Java, autenticação de Operador e aprovação, nenhum registro será persistido/publicado.
- OpenFreeMap Bright é uma instância pública sem chave de API e sem garantia de disponibilidade; seus termos exigem que a pessoa integradora tenha ao menos 18 anos. O fallback usa o serviço padrão de tiles OSM, seguindo atribuição e uso normal do navegador; revisar os termos dos dois serviços, contato e capacidade antes de publicação.
- `bash harness.sh docs` verifica orientação e referências; `bash harness.sh planning` verifica os documentos atuais de produto/roadmap; `bash harness.sh frontend` executa lint, testes e build. E2E de navegador real roda separadamente por `npm run test:e2e` após instalar Firefox e Chromium com Playwright.

Os modos documentais não comprovam o produto. **Testes de unidade/build do frontend não comprovam API, banco real, segurança ou desempenho.** O E2E de navegador valida os fluxos que exercita, não substitui revisão manual com leitor de tela nem garante todos os dispositivos. Resultados efetivamente executados estão em `PLAN.md`.

Os modos `backend` e `all` continuam bloqueados enquanto a aplicação Java e seus testes de integração PostGIS não existirem. O harness não instala dependências nem cria testes. Suítes ausentes/ignoradas não podem ser tratadas como sucesso.

## Roadmap

A ordem aprovada em 10/10/2026 é concluir e validar o frontend demonstrativo, sem banco/API/alertas; depois iniciar a fatia de API + PostgreSQL/PostGIS; então integrar consulta e cadastro conforme decisões de acesso/moderação; mais adiante revisar atualização, cobertura e uso dos polígonos em contexto operacional. Os fluxos de fontes e triagem atuais são exclusivamente manuais, locais e demonstrativos. O estado detalhado está em `PLAN.md`.

Google Maps não foi escolhido para esta entrega: a visualização usa MapLibre/OpenFreeMap com Leaflet/OSM raster como fallback sem WebGL2. Os polígonos estão integrados apenas à demonstração frontend, por autorização informada pelo responsável; não há API, banco, alertas, publicação externa ou versão 1.0.

As funcionalidades permanecem frontend-only. O QA automatizado de WebGL2, Firefox sem WebGL2, teclado e telas estreitas passou em Firefox/Chromium; o mapa 2D e a seleção no cadastro também foram testados com tiles OSM reais em Firefox. A revisão manual com leitor de tela/aparelho físico e a decisão do provedor para publicação continuam pendentes, assim como R0 antes da fase full-stack. Consulte `PLAN.md` para evidências e limites.

As referências visuais originais foram preservadas; `visuais/` continua disponível para comparação e não integra o build Angular. O histórico de alterações desta entrega está em `PATCH_NOTES.md`.
