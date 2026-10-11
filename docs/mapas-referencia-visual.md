# Mapas: referência, fluidez e visual por categoria

Incremento frontend autorizado em 11/10/2026. Atualiza a entrega anterior descrita em [mapas-desempenho-google.md](mapas-desempenho-google.md). A solicitação atual substitui a proposta de migração imediata por análise da referência e melhorias nos renderizadores existentes. Não houve publicação, contratação, conta, ingestão de ocorrências reais ou mudança de stack.

## O que a referência utiliza

A inspeção do HTML e a execução de [Dados de Riscos — mapa RJ](https://dadosderiscos.com.br/mapa-rj-risco-faccoes.html) identificaram **Leaflet 1.9.4**, tiles **CARTO Voyager**, zoom nativo de 8 a 18 e polígonos GeoJSON em grupos de camadas. Não é Google Maps. Arraste, inércia e zoom são comportamentos nativos do Leaflet; não foi identificado plugin especial de fluidez. A referência fornece inspiração visual/interativa, não dados de ocorrências nem credenciais reutilizáveis. Nenhuma chave publicada no HTML foi copiada para o aplicativo.

## Implementação e trade-offs

MapLibre continua principal com aceleração gráfica e Leaflet atende ausência de WebGL2, falha de GPU ou renderizador por software identificado (SwiftShader, llvmpipe/softpipe, Software Rasterizer/Basic Render Driver). Se o navegador ocultar a identificação por privacidade, mantém a tentativa vetorial e a recuperação já existente. Nenhuma preferência do navegador é alterada e a identificação é apenas consultada localmente, sem gravação ou envio. O mapa público persiste entre telas e as atualizações permanecem consolidadas por quadro, conforme o incremento anterior.

- Base vetorial local derivada de **Alidade Bright (Stadia Maps)**: 32 camadas de base, frente às 53 do Alidade Smooth anterior. Água `#b3d5f2`, áreas verdes `#ceead6`, fundo claro `#e8eaed`, vias brancas e rótulos cinza com halo claro aproximam a linguagem visual solicitada do Google Maps. Os pictogramas externos de POIs foram retirados da base; rótulos, atribuição e dados cartográficos permanecem. Isso reduz camadas e carregamento de imagens, sem declarar igualdade com o mapa proprietário do Google.
- JSON do estilo e sprites dos pins ficam no próprio frontend. O estilo é carregado sob demanda, reaproveitado entre mapas e tem timeout de seis segundos; falha permite recuperação raster. O watchdog de prontidão do renderizador continua em oito segundos.
- Leaflet usa **Alidade Bright raster**, mantendo cores de água/vegetação e vias claras. Tiles raster já vêm coloridos pelo provedor: sua paleta é semelhante, mas **não é idêntica à personalização vetorial**. Reprodução exata em raster exigiria outro serviço de renderização/configuração do provedor; não foi contratado.
- O ensaio identificou arraste mais lento no vetorial com GPU por software. A sondagem passa a encaminhar esses ambientes diretamente ao Leaflet, evitando o download inicial de MapLibre/worker/CSS e reproduzindo a navegação nativa da referência. GPU física e identificação oculta continuam limites de verificação.
- No fallback, marcadores e círculo do raio são reaproveitados. Alterações de filtro removem/adicionam somente os pins necessários; alteração do raio atualiza o círculo existente. Isso evita reconstruir todos os elementos a cada scroll. Trade-off: cache limitado aos registros visíveis e aos pins conservados durante a troca para calor; não persiste dados fora da sessão.
- Os mesmos pins aparecem nas duas engines: verde/carro, vermelho/pistola, amarelo/exclamação, borda preta e círculo branco. SVGs alimentam Leaflet; sprites locais de resolução normal/dupla alimentam MapLibre. Formato de gota é autoral, inspirado na referência fornecida. Cor e ícone distinguem categoria; seleção tem realce, sem atribuir significado operacional ao tamanho.

A primeira abertura ainda depende de biblioteca, fontes e tiles externos. Menos camadas/cache não comprovam um SLA ou desempenho em aparelho físico. A comparação instrumentada com a referência e seus limites estão registrados abaixo.

## Raio, intervalo e massa sintética

Raio inicial **1.000 m**, centro na Central do Brasil; mínimo 100 m, máximo 25.000 m. Slider/teclado/scroll mantêm incrementos de 100 m. Com “Filtrar por raio” ligado, clique esquerdo muda o centro e arraste muda só a câmera. Fora desse modo não há mudança implícita do centro. Nenhuma localização pessoal em tempo real foi integrada.

“Intervalo” exibe início/fim em uma coluna que respeita a largura disponível, inclusive na sidebar de desktop e em telas de 390/320 px. Inputs mantêm rótulos, teclado e calendário do navegador.

Continuam **75 ocorrências fictícias (25 por categoria)** e dois POIs. Todas as 25 coordenadas de Segurança ficam exatamente nas posições anteriores. As 50 posições de Trânsito/Contingência usam sorteio determinístico por ID, dentro de dez pequenos recortes urbanos em terra, em nove municípios metropolitanos; são estáveis ao recarregar. Cada ponto sorteado fica a pelo menos **900 m** dos demais sorteados e de Segurança, evitando sobreposição próxima. A distribuição mantém extensão de 40–50 km por categoria e vizinho da mesma categoria a menos de 8 km. O limite anterior de 6,5 km foi ampliado para acomodar o espalhamento solicitado.

Os recortes evitam a Baía de Guanabara sem sortear sobre toda a caixa envolvente metropolitana. São aproximações autorais, **não polígonos oficiais nem prova de pertencimento municipal**. Não alteram a cobertura operacional ou declaram atendimento de toda a RMRJ. Municípios do subconjunto: Rio de Janeiro, Duque de Caxias, São João de Meriti, Nilópolis, Mesquita, Belford Roxo, Nova Iguaçu, Niterói e São Gonçalo. A referência institucional permanece a [formação da RMRJ — IRM](https://www.rj.gov.br/irm/formacao_rjrm).

Proveniência: fixtures sintéticas autorais de 11/10/2026, sem dados pessoais, geocodificação ou ingestão externa. Uso segue a licença do repositório. Coordenadas `[longitude, latitude]`, WGS84/SRID conceitual 4326, distância aproximada em metros no cliente, instantes UTC e exibição `America/Sao_Paulo`. Datas/status não foram transformados em dados reais. A mancha térmica mostra concentração de exemplos, não risco comprovado.

## Fontes e ativos visuais

| Item | Origem e uso | Licença/limite |
|---|---|---|
| Base Bright | [Estilo oficial](https://docs.stadiamaps.com/map-styles/alidade-bright/); JSON obtido em `https://tiles.stadiamaps.com/styles/alidade_bright.json`, consulta em 11/10/2026 | Customização de estilo para a própria aplicação conforme [orientação do provedor](https://docs.stadiamaps.com/custom-styles/). Tiles/fontes seguem serviço/termos Stadia; atribuição Stadia/OpenMapTiles/OpenStreetMap preservada. Desenvolvimento sem autenticação limitado a localhost/127.0.0.1; demais hosts dependem de configuração autorizada. |
| Ícones | [Catálogo MerginIt](https://icons.merginit.com/) como referência; caminhos `car`, `pistol`, `exclamation-thick` obtidos do [repositório oficial Material Design Icons](https://github.com/Templarian/MaterialDesign-SVG), em 11/10/2026 | Ícones Apache 2.0; avisos e texto integral em `frontend/public/licenses/`. Paths incorporados em SVG/sprites locais, sem fonte de ícones ou dependência nova. |
| Forma do pin | [Referência Pixabay 7697708](https://pixabay.com/pt/vectors/pin-mapa-viajar-por-%C3%ADcone-7697708/), consulta em 11/10/2026 | Inspiração de formato; desenho SVG autoral, sem baixar/reutilizar o vetor da página. |
| Referência interativa | Dados de Riscos, URL acima, consulta em 11/10/2026 | Apenas análise pública visual/técnica; não incorpora credencial nem novo dataset. Fonte dos territórios já existentes continua em `fontes-territoriais.md`. |

## Verificação

- `bash harness.sh frontend`: lint, **56 testes unitários**, build **449,26 kB** inicial, abaixo do orçamento de 500 kB, sem avisos. Nenhuma dependência nova; mapa/CSS/estilo permanecem lazy.
- `npm run test:e2e -- --workers=1`: **44 passados, nenhum ignorado**, em Chromium e Firefox. Inclui base raster real nos mapas público/cadastro, recuperação de GPU/estilo/timeout, clique/arraste condicionado ao raio, scroll/teclado, filtros/lista/territórios, pins/popups das três categorias, preservação de marcador e intervalo a 320/390/1.280 px. Testes de interação raster usam tiles simulados; teste separado mantém tiles reais.
- Capturas inspecionadas em `frontend/test-results/*-interval-*.png`, `*-pin-*.png` e `*-metropolitan-heatmap.png`; traces permanecem disponíveis para falhas, fora do Git. MapLibre altera IDs textuais de GeoJSON na representação interna; a correção usa `properties.recordId` para localizar o registro do popup, validado ao clicar nas três categorias.
- Sprites de alta resolução conferidos em Chromium com `deviceScaleFactor=2`: três imagens de 64×88 px, `pixelRatio=2`, preservando tamanho visual de 32×44 px. SVGs do Leaflet são vetoriais.
- Os cenários vetoriais do E2E usam WebGL2 real com identificação de GPU acelerada simulada, pois o CI oferece GPU por software; shaders/worker/canvas permanecem reais. O cenário dedicado verifica a escolha 2D com WebGL2 disponível e identidade de software. GPU física não foi validada.
- `bash harness.sh planning` e `git diff --check` passaram; são verificações estruturais. Backend/PostGIS não foram executados, pois não existem nesta fase autorizada.

## Comparação de arraste

Ensaio Chromium Playwright **156.0.8078.4 headless**, GPU SwiftShader por software, viewport 1.280×900 px, mapa 800×480 px, DPR 1. Mesma câmera/escala: centro `[-43.1954, -22.9037]`, zoom MapLibre 12/Leaflet 13. Todos os mapas com 1.671 polígonos; o app também contém 75 pins sintéticos, ausentes na referência. Tiles reais, rede sem controle e aquecimento de 3,5 segundos antes da coleta. HTML de referência congelado na consulta, apenas instrumentado para acessar a instância Leaflet.

Três arrastes por condição: 48 movimentos de 3 px, espera solicitada de 16 ms entre movimentos e 300 ms de coleta depois de soltar. Mede intervalos de callbacks `requestAnimationFrame`, **não latência até o pixel pintado nem FPS de GPU física**. Tabela usa a mediana das três medianas/p95; contagem soma as três passagens.

| Condição | Mediana entre callbacks | p95 | Intervalos >50 ms |
|---|---:|---:|---:|
| Referência Leaflet/Voyager | 16,7 ms | 16,7 ms | 0 |
| App vetorial forçado em GPU por software | 49,9 ms | 50,1 ms | 24 |
| App com escolha automática (selecionou Leaflet) | 16,7 ms | 16,8 ms | 0 |
| App com WebGL2 indisponível (Leaflet) | 16,7 ms | 16,7 ms | 0 |

**Conclusão limitada ao ensaio:** a escolha 2D nesses ambientes reproduziu a cadência da referência e eliminou os intervalos longos observados ao forçar o vetorial na GPU por software. Não foi comprovada equivalência universal, redução de latência de rede ou desempenho em celular/GPU física. Se a identificação estiver oculta pelo navegador, continua pendente medir o caminho vetorial nesse equipamento.

Resultados sem URLs de credenciais e com cada passagem: [evidência JSON](evidencias/mapas-arraste-2026-10-11.json). Scripts/snapshots/capturas temporários da sessão em `/tmp/vetor-reference-study/`; capturas funcionais permanecem em `frontend/test-results/`. Nenhuma chave de serviço foi incluída na evidência/repositório.

Próxima ação: revisão do incremento pelo responsável e, no gate de QA manual já existente, conferir navegador habitual/aparelho físico e leitor de tela. Não iniciar banco/API ou contratação nesta tarefa.
