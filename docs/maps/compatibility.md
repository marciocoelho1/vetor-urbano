# Compatibilidade dos mapas — Firefox e Chromium

Verificação local em 11/10/2026. Escopo: frontend demonstrativo; nenhuma alteração no backend, banco, perfil pessoal do Firefox, configuração GPU do sistema ou contratação de mapas.

## Ajuste visual solicitado em 11/10/2026

O último commit da branch de trabalho `master`, `9574a63`, alterou o mapa-base do commit `293893c`: antes havia raster OpenStreetMap no MapLibre, com opacidade 0,82; depois passou a usar **OpenFreeMap Bright vetorial** no WebGL2 e **OpenStreetMap padrão raster** no Leaflet. A correção do Firefox não exige essas bases diferentes: foi essa configuração, e não o navegador, que mudou cores, vias e rótulos. As correções de recuperação que já estavam no diretório de trabalho foram preservadas.

O HTML da [referência Dados de Riscos](https://dadosderiscos.com.br/mapa-rj-risco-faccoes.html) usa **CARTO Voyager raster**. Hoje o [CARTO exige chave própria](https://github.com/CartoDB/basemap-styles); uma chave de outro site não pode ser reutilizada. A solução local implementada usa **Alidade Smooth**, uma aproximação moderna e suave derivada de Positron/CartoDB, nos dois renderizadores e nos dois mapas. A estrutura, navegação, controles, filtros, dados e cores das camadas do produto foram preservados; somente a base, atribuição e equivalência de escala foram ajustadas.

A [documentação oficial Stadia](https://docs.stadiamaps.com/authentication/) dispensa autenticação em localhost/127.0.0.1. **Outros hosts, inclusive IP da rede local, exigem domínio autorizado ou chave própria.** Não houve cadastro, contratação, publicação nem uso de credenciais de terceiros. Esse é o limite da configuração demonstrativa; o Voyager exato permanece dependente de credencial própria e decisão do provedor.

### Erros adicionais identificados e corrigidos

- MapLibre usa mundo de 512 px no zoom zero e Leaflet, 256 px. Reutilizar o número de zoom sem conversão duplicava a extensão linear da câmera (aproximadamente quatro vezes a área), agravado pelo arredondamento do Leaflet. O fallback agora soma um nível, aceita décimos e tem limites correspondentes; a centralização de ocorrências e o enquadramento de territórios também usam escala/padding equivalentes. A regressão compara os quatro extremos geográficos antes/depois da perda de GPU, além dos pixels do ponto e das coordenadas.
- Créditos personalizados no MapLibre duplicavam os créditos do próprio estilo. O mapa vetorial usa a atribuição fornecida pelo estilo; o Leaflet mantém os créditos exigidos no asset.
- Capturas imediatamente após `tileload` podiam mostrar a animação de fade pela metade. O teste com raster real espera todos os tiles visíveis carregarem e atingirem opacidade 1 antes da captura.

Fontes de escala: [Leaflet zoom](https://leafletjs.com/examples/zoom-levels/); MapLibre 6.11.2 instalado, `src/geo/transform_helper.ts` (`_tileSize = 512`, `worldSize = _tileSize * _scale`).

### Verificação atual

- `bash scripts/verify.sh frontend`: status 0; lint, **49 testes**, build; bundle inicial **440,38 kB**, sem avisos e abaixo de 500 kB. Sem mudança de dependências/lockfile.
- `npm run test:e2e -- --workers=1`: **34 passados, zero ignorados**, em 1,3 min. WebGL2 real e fallback 2D em Firefox/Chromium; mapa público/cadastro com raster real HTTP 200; falhas de GPU/estilo/watchdog/provedores, coordenadas, raio, filtros e 390/320 px. Extremos geográficos da câmera conservados após recuperação, inclusive com zoom fracionário e centralização de ocorrência.
- Firefox Playwright **157.0 com janela**, perfil temporário e WebGL2 desativado por script: Leaflet 2D, **22 respostas de tiles HTTP 200**, zero erros JavaScript, cadastro nas três categorias e clique preenchendo coordenadas. JSON/capturas em `/tmp/vetor-map-evidence/`; esta prova usa o navegador Playwright, não o perfil pessoal nem o Firefox instalado do sistema. Uma verificação anterior nesta sessão também carregou MapLibre/WebGL2 com janela.
- Capturas finais inspecionadas: `apps/web/test-results/firefox-smooth-raster-real.png` e `apps/web/test-results/chromium-mapa-desktop.png`; mapa-base suave, escala equivalente e créditos sem duplicação. Raster e vetor ainda diferem na renderização de fontes e no detalhe dos tiles.
- Uma rodada intermediária foi interrompida: o cenário de teste tentava selecionar uma ocorrência depois de o filtro de raio excluí-la. A ordem foi corrigida; a suíte completa final passou. Nenhum teste foi removido ou ignorado.
- O primeiro build ficou bloqueado pelo DNS do sandbox ao baixar fontes Google; a execução autorizada com rede passou. A suíte de navegadores também precisou de execução autorizada fora do sandbox para iniciar servidor/navegadores.

`bash scripts/verify.sh planning` (inclui docs) e `git diff --check` passaram. São verificações estruturais. Resultados e próxima ação registrados em `PLAN.md`. A suíte conserva os testes de recuperação anteriores e acrescenta raster real no mapa público/cadastro, sem interceptação, em Firefox/Chromium. Os testes reais são executados em localhost, com tiles da área visível e sem download em massa; rede indisponível ou rate limiting devem causar falha, não sucesso simulado.

## Diagnóstico e limite da reprodução

- O Firefox 157.0.1 instalado apresentou WebGL2 disponível em headless e indisponível com janela/perfil temporário. A existência da API JavaScript não comprova que o contexto gráfico exigido pelo MapLibre possa ser criado; disponibilidade depende também do ambiente gráfico.
- Os caminhos normais anteriores carregaram nesta investigação, inclusive o fallback sem WebGL2. Portanto, a falha exata do perfil utilizado pelo responsável não foi reproduzida nem atribuída a uma preferência/driver específico.
- Falhas concretas do aplicativo foram reproduzidas em testes de navegador: se a sondagem WebGL2 tinha sucesso mas o contexto do renderizador falhava, o mapa ficava no erro sem tentar Leaflet. Erro inicial do provedor vetorial e perda de contexto GPU também não acionavam o fallback. Um erro isolado após o mapa público estar pronto podia cobri-lo inteiro com a tela de indisponibilidade.
- No raster, o evento Leaflet `load` significa que os tiles terminaram de processar, não que houve sucesso. Todos os tiles retornando 503 ainda removiam o erro; isso foi reproduzido e corrigido.

## Comportamento implementado

1. Sem WebGL2, carregar diretamente Leaflet/CSS e configuração raster; não carregar o engine/worker MapLibre nesse caminho.
2. Com WebGL2 utilizável, manter MapLibre/Alidade Smooth, sem detecção por User-Agent e sem forçar aceleração por software.
3. Falha no construtor, erro antes do primeiro `idle`, perda de contexto ou inicialização vetorial sem primeiro `idle` após oito segundos: remover o mapa vetorial e carregar o mapa 2D. O watchdog começa depois de carregar as bibliotecas; não é um prazo global de download/tiles.
4. Depois de uma falha vetorial, reutilizar o caminho raster na mesma instância do aplicativo, inclusive no cadastro, evitando repetir a tentativa falha a cada navegação. Recarregar a página permite nova avaliação.
5. Na recuperação dos dois mapas, conservar centro e escala geográfica (`zoom Leaflet = zoom MapLibre + 1`, com `zoomSnap: 0.1`), além dos filtros, raio e registros locais. No cadastro, coordenadas digitadas/selecionadas continuam no estado da aplicação e o ponto visível não desaparece por reinicialização da câmera na Central do Brasil.
6. Erro isolado de tile após primeiro `idle` não bloqueia o mapa vetorial inteiro. Perda de contexto continua sendo motivo de recuperação, mesmo depois de pronto.
7. No mapa 2D, o primeiro tile realmente carregado libera a interface. Se o ciclo inicial terminar sem nenhum tile bem-sucedido, manter o erro; lista/filtros e entrada manual de coordenadas continuam disponíveis.
8. Cancelar o watchdog e desativar callbacks de saúde ao sair da tela, tentar novamente ou destruir o componente.

As bibliotecas continuam lazy, sem novas dependências da aplicação. Serviços cartográficos continuam sujeitos à rede, aos termos e à disponibilidade externos, sem SLA contratado. A recuperação não oferece mapa offline.

## Evidências anteriores — recuperação com OpenFreeMap/OSM

- RED: teste de sondagem bem-sucedida/contexto real recusado falhou em Firefox e Chromium por ausência do mapa Leaflet; GREEN após recuperação no construtor.
- RED: erro inicial de estilo e perda de contexto falharam no Firefox; GREEN nos dois motores após recuperação assíncrona.
- RED: teste de watchdog não detectou a falha no limite de oito segundos; GREEN depois de adicionar prazo e cancelamento.
- RED: todos os tiles raster com 503 apagavam o erro; GREEN preserva erro/lista e campos de coordenadas.
- Revisão independente identificou perda da câmera do cadastro ao recuperar contexto GPU; teste reproduziu nos dois motores um ponto selecionado fora do enquadramento raster. GREEN após preservar centro/zoom; teste verifica pixels do marcador no centro do Canvas 2D e coordenadas inalteradas.
- `bash scripts/verify.sh frontend`: formatação, 49 testes de unidade e build passaram. Bundle inicial 441,15 kB (limite 500 kB), sem avisos; MapLibre JS/CSS 1,07 MB/83,13 kB e Leaflet JS/CSS 149,42 kB/11,07 kB continuam sob demanda.
- `npm run test:e2e -- --workers=1`: 32 testes passaram, nenhum ignorado. Inclui WebGL2 real, fallback sem WebGL2 nos dois motores, recuperação de GPU/estilo separada no cadastro, estilo sem resposta, perda de contexto, indisponibilidade dos dois provedores, raio, territórios, teclado, filtros, detalhes e exportação. Viewports de 390/320 px não apresentaram overflow horizontal com MapLibre nem Leaflet; cadastro 2D foi conferido nas três categorias.
- Selenium em Firefox **instalado**, 157.0.1, com janela e perfil temporário: mapa público com nove tiles OSM carregados/zero imagens com falha; Canvas 2D continha pixels desenhados de marcadores e rótulos S/I presentes. Cadastro com doze tiles carregados/zero imagens com falha; clique preencheu longitude/latitude. Nenhuma interceptação de tiles nessa verificação.
- Tempo observado nesse smoke local: 602 ms até primeiro tile e saída do estado de carregamento; entrada/troca das categorias do cadastro 104/66/64 ms, respectivamente. Medição única de máquina/rede locais, não percentil, teste de carga, garantia para 4G ou comprovação de RNF01/RNF05.

Tiles dos cenários raster Playwright são simulados para repetibilidade; o smoke do Firefox instalado valida rede/cartografia separadamente. Artefatos locais de navegador ficam em `apps/web/test-results/` e capturas/JSON do smoke ficam no scratch da sessão, fora do Git.

## Próxima etapa

`bash scripts/verify.sh planning`, `bash scripts/verify.sh docs` e `git diff --check` passaram; são verificações estruturais. A revisão independente não apontou outro blocker concreto; o ajuste de câmera encontrado foi reproduzido e corrigido com regressão nos dois motores.

Correção de compatibilidade restrita ao frontend. Revisão manual com leitor de tela/aparelho físico e decisões R0 permanecem no plano; nenhuma fase de API/banco foi iniciada. Antes de publicação, decidir provedor, termos, capacidade e disponibilidade. O roadmap canônico permanece em `PLAN.md`.

## Incremento posterior: desempenho e raio/metropolitana

Em 11/10/2026, após as evidências acima, foram implementados reaproveitamento do mapa público, atualização por quadro sem submissões duplicadas, ResizeObserver, raio de 25 km e 75 fixtures metropolitanas. Verificação: 54 testes de unidade e 38 E2E passaram, build 444,20 kB inicial. Análise atual de Google Maps e limites em [mapas-desempenho-google.md](performance-google.md); roadmap em `PLAN.md`. As medições/resultados anteriores permanecem históricos.
