# Vetor Urbano

Aplicação demonstrativa para consulta e análise geográfica de ocorrências, com evolução possível para colaboração e alertas. Stack planejada: **Angular + SCSS, Java e PostgreSQL/PostGIS**.

## Branch e continuidade

A branch de continuidade é **`main`**. A consolidação autorizada em 11/10/2026 incorpora o histórico de `master`, as melhorias locais mais recentes e o conteúdo exclusivo da antiga `main`, sem reescrever commits. A aplicação atual fica em `frontend/`; `vetor-urbano-web/` foi substituído por essa versão. A comparação dos históricos, as divergências e as evidências estão em [docs/consolidacao-branches-2026-10.md](docs/consolidacao-branches-2026-10.md).

Requisitos e decisões atuais ficam em `docs/escopo.md`, `docs/arquitetura.md` e `PLAN.md`. Os arquivos em `docs/specs/`, `docs/architecture/`, `planejamento/` e o SQL em `vetor-urbano-api/` são **legado preservado para reconciliação**, não contratos executáveis nem autorização para desenvolver uma API de escrita pública. Os IDs históricos são mantidos em seus documentos de origem; diferenças de categorias, RF/RNF e moderação precisam ser resolvidas em R0.

## Estado implementado

Existe uma **demonstração frontend Angular** em `frontend/`, derivada da identidade visual dos anexos: navegação entre mapa e cadastro, filtros acumuláveis, busca de ocorrências e áreas, painel recolhível, mapa ampliado, formulário progressivo por categoria, lista alternativa e camadas de densidade separadas. O protótipo também apresenta histórico/informes ativos, dashboard, reprodução temporal, comparação, filtros salvos, triagem manual de referências e exportação XLSX.

O filtro de raio fica dentro do mapa: inicia em 1.000 m, pode ser ajustado em passos de 100 m pelo slider ou pelo scroll do mouse, entre 100 e 25.000 m e aparece como polígono roxo-claro `#C4B5FD` com preenchimento transparente. Com “Filtrar por raio” ligado, clique esquerdo muda o centro e segurar/arrastar move apenas o mapa; desligado, cliques não mudam o centro. O cálculo é local e aproximado. Períodos usam calendário e hora de Brasília; datas/horários personalizados ficam no filtro por período, com campos de intervalo em uma coluna responsiva.

O centro inicial dos mapas e do filtro por raio é a Central do Brasil, nas coordenadas GeoJSON `[longitude, latitude]` `[-43.19156448029434, -22.903318808380494]`. Em **Registrar ocorrência**, o mapa fica embutido em **Indique o local** para Trânsito, Segurança e Contingência; clicar/toque preenche longitude e latitude, que também podem ser digitadas.

Em **Resultados visíveis**, cada registro pode abrir/fechar seus detalhes no próprio item. Até cinco painéis podem permanecer abertos; ao mudar filtros, detalhes que deixam de estar visíveis são fechados.

A exportação XLSX usa rótulos e valores de apresentação pt-BR, horários de Brasília, colunas com larguras explícitas, cabeçalhos formatados/fixos, filtros de planilha e ajuste de impressão em paisagem.

Arquivos CSV agregados e GeoJSON de eventos podem ser importados manualmente após informar origem, URL, licença/autorização, data de referência e limitações. O conteúdo é processado na aba atual e descartado ao atualizá-la/fechá-la. Nenhum arquivo é enviado; não há conexão automática com ISP-RJ, Fogo Cruzado, OTT, COR ou jornais. Estatísticas agregadas permanecem separadas de eventos geolocalizados. Registros sintéticos seguem identificados; polígonos territoriais são camada estática atribuída à fonte e com ressalvas explícitas.

Ainda **não existe backend Java executável, API, autenticação, persistência PostgreSQL/PostGIS ou fluxo real de moderação**. O botão valida o cadastro demonstrativo, mas não envia dados. Não publicar nem usar a interface para decisões de segurança.

O renderizador principal é **MapLibre** com estilo local derivado de **Alidade Bright (Stadia Maps)**, com água azul, áreas verdes e vias claras. Sem WebGL2, com GPU por software identificada ou após falha, usa **Leaflet/Alidade Bright raster**, configurado em `frontend/public/maps/raster-provider.json`. A paleta raster é semelhante, mas não idêntica ao estilo vetorial personalizado. As bibliotecas/CSS continuam sob demanda; ambos preservam pontos, popups, calor, raio, territórios e cadastro. A conversão `zoom Leaflet = zoom MapLibre + 1` mantém a escala da câmera entre renderizadores. A atribuição permanece visível e a lista continua acessível quando o mapa falha. A camada territorial está em `frontend/public/maps/areas-territoriais.geojson`; sua origem, data-base e limites estão em `docs/fontes-territoriais.md`.

O novo mapa-base aproxima o visual suave da referência Dados de Riscos, que usa CARTO Voyager. **Stadia permite desenvolvimento em `localhost`/`127.0.0.1` sem autenticação, sujeito a limites. Outros hosts, inclusive IP de rede local, exigem domínio autorizado ou chave própria antes do uso.** CARTO Voyager também exige chave própria atualmente; nenhuma chave da referência foi reutilizada e nenhum serviço foi contratado. Fontes, critérios e limites atuais estão em [docs/mapas-referencia-visual.md](docs/mapas-referencia-visual.md); a análise anterior permanece em `docs/compatibilidade-mapas.md`.

A massa local tem 25 ocorrências fictícias por categoria (75 no total) em nove municípios metropolitanos, além de dois POIs. Segurança conserva suas coordenadas; Trânsito/Contingência usam posições pseudoaleatórias estáveis, em recortes urbanos em terra, com separação mínima de 900 m dos demais eventos. Pins têm borda preta/círculo branco: verde/carro, vermelho/pistola, amarelo/exclamação. O mapa público conserva câmera/tiles ao navegar, as alterações rápidas são consolidadas por quadro e o fallback reaproveita marcadores/círculo. Evidências atuais em [docs/mapas-referencia-visual.md](docs/mapas-referencia-visual.md); análise anterior do Google em [docs/mapas-desempenho-google.md](docs/mapas-desempenho-google.md).

O recorte territorial solicitado é a cidade do Rio de Janeiro e a Baixada Fluminense. A lista de municípios e os limites ainda não foram definidos; não declarar cobertura completa.

**Recuperação Firefox/Chromium:** a sondagem escolhe Leaflet diretamente para SwiftShader/llvmpipe/softpipe e outros renderizadores por software reconhecidos. Se a identificação estiver oculta por privacidade, tenta MapLibre. Detectar WebGL2 não garante que MapLibre consiga inicializar. Falha de criação do mapa, erro inicial, perda de contexto GPU ou ausência do primeiro `idle` após oito segundos também acionam Leaflet; nessa instância, o cadastro e as próximas navegações reutilizam raster. Um erro isolado de tile após mapa vetorial pronto não bloqueia a tela inteira. O raster libera o carregamento no primeiro tile efetivamente recebido, sem tratar todos os tiles falhados como sucesso. Nenhuma preferência do Firefox nem configuração GPU precisa ser alterada. Evidências e limites: [`docs/compatibilidade-mapas.md`](docs/compatibilidade-mapas.md).

## Organização existente

| Caminho | Finalidade |
|---|---|
| `AGENTS.md` | Regras estáveis de colaboração, segurança e verificação |
| `PLAN.md` | Estado real, evidências, marcos e único detalhamento da próxima tarefa |
| `PATCH_NOTES.md` | Alterações desta entrega, verificações e pendências conhecidas |
| `docs/consolidacao-branches-2026-10.md` | Comparação das branches, resolução do merge e evidências |
| `docs/PROJECT-LOG.md` | Histórico preservado da antiga main, com registro da consolidação |
| `vetor-urbano-api/` | Rascunho SQL histórico não aplicado; nenhuma aplicação Java |
| `videos/vetor-urbano-motion/` | MP4 de marca e arquivos existentes; fontes finais ausentes |
| `mapa-rj-extraction/` | Script e relatório da extração; downloads brutos locais excluídos |
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

`frontend/` contém o protótipo Angular. `backend/` não existe; `vetor-urbano-api/` guarda somente o rascunho SQL anterior, ainda não aplicado. O wrapper `harness/verify.sh` encaminha para `harness.sh` e verifica o frontend atual por padrão.

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

Os testes E2E iniciam o servidor Angular local e exercitam MapLibre/WebGL2, Leaflet sem WebGL2 nos dois motores (tiles simulados para repetibilidade), falhas de GPU/estilo, timeout vetorial, filtros/raio/territórios, mapa inline de cadastro, detalhes, teclado e larguras de 390/320 px nos dois renderizadores. Incluem pins/popups por categoria, preservação de marcadores ao mudar o raio, início em 1 km e responsividade do intervalo. Capturas, traces e downloads ficam em `frontend/test-results/`, excluídos do Git. Cenários separados carregam Alidade Bright raster real no mapa público/cadastro dos dois motores, sem interceptação. A matriz final passou com **44 testes/zero ignorados**; `harness frontend` passou com **56 testes e build de 449,26 kB**, sem avisos. Evidências em `PLAN.md`.

- O mapa principal depende de WebGL2. Sem WebGL2 ou com GPU por software identificada, o fallback 2D busca tiles raster pela configuração estática; ambos dependem de rede/provedor. Nos testes atuais Firefox/Chromium sem WebGL2, os tiles reais Alidade Bright retornaram HTTP 200; atribuição e seleção de coordenadas foram verificadas. Se ambos os renderizadores falharem, lista e filtros continuam acessíveis. O raio usa centro selecionável/digitável e é uma estimativa local.
- Os exemplos de formulário não são enviados. Sem API Java, autenticação de Operador e aprovação, nenhum registro será persistido/publicado.
- Alidade Bright é a família de mapa-base; o estilo vetorial é personalizado localmente. Antes de executar fora de localhost/127.0.0.1, configurar autenticação autorizada e revisar termos/limites do Stadia Maps; nenhuma conta, assinatura ou SLA foi provisionado.
- `bash harness.sh docs` verifica orientação e referências; `bash harness.sh planning` verifica os documentos atuais de produto/roadmap; `bash harness.sh frontend` executa lint, testes e build. E2E de navegador real roda separadamente por `npm run test:e2e` após instalar Firefox e Chromium com Playwright.

Os modos documentais não comprovam o produto. **Testes de unidade/build do frontend não comprovam API, banco real, segurança ou desempenho.** O E2E de navegador valida os fluxos que exercita, não substitui revisão manual com leitor de tela nem garante todos os dispositivos. Resultados efetivamente executados estão em `PLAN.md`.

Os modos `backend` e `all` continuam bloqueados enquanto a aplicação Java e seus testes de integração PostGIS não existirem. O harness não instala dependências nem cria testes. Suítes ausentes/ignoradas não podem ser tratadas como sucesso.

## Roadmap

A ordem aprovada em 10/10/2026 é concluir e validar o frontend demonstrativo, sem banco/API/alertas; depois iniciar a fatia de API + PostgreSQL/PostGIS; então integrar consulta e cadastro conforme decisões de acesso/moderação; mais adiante revisar atualização, cobertura e uso dos polígonos em contexto operacional. Os fluxos de fontes e triagem atuais são exclusivamente manuais, locais e demonstrativos. O estado detalhado está em `PLAN.md`.

Google Maps não foi escolhido para esta entrega: a visualização usa MapLibre/estilo Bright personalizado com Leaflet/Alidade Bright raster como fallback sem WebGL2. Os polígonos estão integrados apenas à demonstração frontend, por autorização informada pelo responsável; não há API, banco, alertas, publicação externa ou versão 1.0.

As funcionalidades permanecem frontend-only. O QA automatizado de WebGL2, Firefox sem WebGL2, teclado e telas estreitas passou em Firefox/Chromium; o mapa 2D e a seleção no cadastro também foram testados com tiles Alidade Bright reais nos dois motores. A revisão manual com leitor de tela/aparelho físico e a decisão do provedor para publicação continuam pendentes, assim como R0 antes da fase full-stack. Consulte `PLAN.md` para evidências e limites.

As referências visuais originais foram preservadas; `visuais/` continua disponível para comparação e não integra o build Angular. O histórico de alterações desta entrega está em `PATCH_NOTES.md`.

## Vídeo de marca

O [MP4 de 15 segundos](videos/vetor-urbano-motion/renders/vetor-urbano-15s.mp4) está preservado no repositório, com 1920 × 1080, 30 fps e áudio estéreo. A auditoria encontrou o vídeo final, mas não os arquivos da composição editável correspondente; o `index.html` disponível é um template inicial. Veja [docs/video-marca.md](docs/video-marca.md) antes de tentar reedição ou nova renderização. O vídeo não faz parte do build Angular.
