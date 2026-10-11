# Auditoria de fontes cartográficas e territoriais

Atualizado em 11/10/2026. Esta auditoria registra a triagem das fontes, as geometrias agora disponibilizadas para a demonstração local e as limitações ainda não verificadas.

## Mapa de presença — Dados de Riscos

- Página consultada: `https://dadosderiscos.com.br/mapa-rj-risco-faccoes.html`.
- O mapa se identifica como informativo e baseado em fontes públicas. Exibe data-base **julho de 2026**, **1.671 áreas mapeadas** e sete grupos/categorias: CV, TCP, ADA, milícias, Liga da Justiça, milícia de Nova Iguaçu e área neutra.
- A própria descrição ressalva que presença mapeada não é afirmação oficial, que a dinâmica territorial muda e que podem existir imprecisões. Esses nomes e contagens são declarações da fonte, não dados verificados pelo Vetor Urbano.
- Na página consultada não foi localizado arquivo de geometrias para download nem licença explícita de reutilização. Em 10/10/2026, o responsável pelo Vetor Urbano informou que os dados são abertos, declarou possuir autorização e autorizou sua utilização no projeto. Essa autorização do responsável permite o uso nesta demonstração; a auditoria não verifica de forma independente o instrumento concedido pela fonte.
- `frontend/public/maps/areas-territoriais.geojson` é uma cópia byte a byte do `poligonos-original.geojson` extraído localmente em `mapa-rj-extraction/`. Contém 1.671 polígonos e 49.294 pares de coordenadas; o SHA-256 da cópia é `8848047b48da0859a8410b11804340eecac0692e214f85a4d9def30e09797ceb`. Para preservar o escopo decidido para o repositório público, somente o GeoJSON necessário ao app será versionado; a extração bruta de 13,5 MB, HTML e CSVs locais não serão enviados.
- Os atributos originais por polígono são somente `n` (nome) e `f` (classificação). O Vetor Urbano atribui IDs sequenciais em memória para selecionar geometrias; esses IDs não são identificadores da fonte. A validação topológica e a atualização após julho de 2026 não foram realizadas.

## Mapa Histórico — GENI/UFF e Instituto Fogo Cruzado

- Página do mapa indicada: `https://fogocruzado.org.br/mapadosgruposarmados/`.
- Artigo de apresentação da versão 2025: `https://fogocruzado.org.br/relatorios/mapa-historico-dos-grupos-armados-expoe-reorganizacao-territorial-do-crime-no-rio/` (publicado em 04/12/2025; resultados descritos referem-se a 2024).
- A metodologia publicada descreve denúncias anônimas do Disque Denúncia, geocodificação, classificação algorítmica, validação por imprensa/literatura especializada e shapefile refinado à escala censitária. A análise separa **controle** de **influência**, conceitos distintos de “presença mapeada”.
- A página interativa não expôs, na consulta realizada, um arquivo de polígonos ou uma licença de redistribuição que permita comparar geometrias. A matéria e o mapa permitem contextualização metodológica, mas não um cruzamento espacial reprodutível.

## Comparabilidade e decisão para a demonstração

As fontes usam conceitos, métodos e datas diferentes. Contagens ou nomes parecidos não demonstram que dois polígonos representam a mesma área; a classificação “presença” não pode ser convertida automaticamente em controle/influência. Não calcular interseção, união ou equivalência espacial sem os arquivos originais, sistemas de referência, data de cada geometria e autorização de uso.

**Decisão aprovada para a demonstração local:** exibir a camada extraída do mapa Dados de Riscos, com filtros por grupo, busca e atribuição explícita à fonte. O rótulo informa “classificação segundo a fonte”, base julho/2026 e ressalva que a camada não confirma a situação atual nem limites municipais oficiais. “Área neutra” será apresentada como classificação da fonte, não como afirmação independente de neutralidade ou segurança. O usuário autorizou o uso dos polígonos. A camada é demonstrativa; qualquer publicação/uso operacional requer revisão de atualização, cobertura, precisão e comunicação de risco.

## Mapa-base demonstrativo — incremento anterior em 11/10/2026

A referência Dados de Riscos usa tiles **CARTO Voyager**, identificados na chamada `L.tileLayer` do HTML consultado em 11/10/2026. O CARTO passou a exigir chave própria; seu repositório oficial informa marca d'água para requisições raster sem chave e descontinuação gradual do raster. Nenhuma chave da referência foi copiada.

Nesse incremento anterior, a demonstração passou a usar **Alidade Smooth (Stadia Maps)**, uma aproximação do mapa suave de referência: base clara, cores discretas e rótulos leves para destacar as camadas do produto. O estilo deriva de Positron/CartoDB; não se declara reprodução exata de Voyager. MapLibre usa o estilo vetorial oficial e Leaflet usa raster da mesma família, mantendo pontos, polígonos, raio e formulário existentes.

- Vetorial: `https://tiles.stadiamaps.com/styles/alidade_smooth.json`.
- Raster: `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png`, em `frontend/public/maps/raster-provider.json`.
- Dados: OpenStreetMap (ODbL), esquema OpenMapTiles; estilo/derivações e serviço conforme [atribuição Stadia Maps](https://stadiamaps.com/attribution/) e [termos](https://stadiamaps.com/terms-of-service/).
- Atribuição visível: Stadia Maps, OpenMapTiles e OpenStreetMap. No MapLibre vem do estilo, sem duplicação; no Leaflet vem da configuração raster.
- Data de consulta: 11/10/2026. Nenhum dado de ocorrência externa foi ingerido nesta alteração.
- **Limite real da configuração:** Stadia dispensa autenticação no desenvolvimento em `localhost`/`127.0.0.1`, sujeito a rate limits. Outros hosts (incluindo IP de LAN) exigem domínio autorizado ou chave própria. Nenhuma conta/contrato foi criado. Publicação continua pendente de provedor, autenticação, termos e capacidade.
- A camada territorial é o GeoJSON local previamente autorizado; estilo/base cartográfica, territórios e ocorrências continuam distintos.

Verificação: testes de navegador exercitam WebGL2 real e raster real nos dois motores, além de simulações de falhas. Evidências e limitações atuais em `compatibilidade-mapas.md`. O serviço depende da rede; esta execução não comprova disponibilidade futura ou SLA. Não há prefetch/download em massa.

Fontes primárias: [estilo e URLs](https://docs.stadiamaps.com/map-styles/alidade-smooth/), [autenticação e limites locais](https://docs.stadiamaps.com/authentication/), [CARTO basemap-styles](https://github.com/CartoDB/basemap-styles), [CARTO termos](https://carto.com/legal/basemap-terms/index.html).

## Mapa-base e pins — atualização atual em 11/10/2026

A solicitação seguinte substituiu Smooth por **Alidade Bright**: estilo vetorial local com água azul/áreas verdes/vias brancas e raster Bright de paleta semelhante. Referência continua Leaflet/CARTO Voyager; não houve migração para Google nem reutilização de chave. JSON vetorial deriva de `https://tiles.stadiamaps.com/styles/alidade_bright.json`; raster usa `https://tiles.stadiamaps.com/tiles/alidade_bright/{z}/{x}/{y}.png`. Atribuição, dependência de rede e limites de autenticação do Stadia permanecem.

Ícones locais de categoria são Material Design Icons (Apache 2.0), obtidos do repositório oficial; forma do pin é autoral, inspirada na referência Pixabay fornecida. Origens, licenças, data de consulta, paletas e limites completos em [mapas-referencia-visual.md](mapas-referencia-visual.md). A massa de eventos é sintética: Segurança conserva as posições; Trânsito/Contingência usam sorteio por ID em recortes urbanos em terra, sem incorporar fonte externa ou certificar limites municipais.

## Próximo gate

1. Preservar a atribuição e o registro da autorização fornecida pelo responsável; não apresentar a autorização como validação da fonte.
2. Antes de publicação/uso operacional, conferir validade topológica, atualização, cobertura e precisão do arquivo.
3. Manter “presença” separado de “controle” e “influência”; não inferir risco atual nem segurança a partir das cores.
4. Revisar comunicação, privacidade e possibilidade de contestação antes de ampliar o uso.
