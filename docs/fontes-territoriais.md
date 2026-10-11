# Auditoria de fontes cartográficas e territoriais

Atualizado em 10/10/2026. Esta auditoria registra a triagem das fontes, as geometrias agora disponibilizadas para a demonstração local e as limitações ainda não verificadas.

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

## Mapa-base demonstrativo

O renderizador principal é MapLibre GL JS com o estilo vetorial Bright da instância pública OpenFreeMap, cujos dados cartográficos incluem OpenStreetMap/OpenMapTiles e Natural Earth. A atribuição permanece visível; o estilo não exige chave de API. O serviço é fornecido “as is”, sem garantia de disponibilidade, e seus termos exigem que quem integra tenha ao menos 18 anos e possa celebrar o acordo.

A camada territorial é um GeoJSON local do projeto, não fornecido pelo OpenStreetMap nem validado por ele. Estilo/base cartográfica, camada de territórios e dados de ocorrências são elementos distintos.

Quando o navegador não fornece WebGL2, o protótipo carrega Leaflet 1.9.4 e seus estilos sob demanda e usa tiles raster. A configuração fica em `frontend/public/maps/raster-provider.json`, fora do JavaScript, para permitir substituir URL, zoom e atribuição sem recompilar o bundle. O padrão usa o serviço raster padrão do OpenStreetMap, atribui `© OpenStreetMap contributors` e inclui o link “Corrigir mapa”. O mapa solicita apenas os tiles da área visualizada; não há download em massa nem prefetch configurado.

Smoke test independente em Firefox 157 headless, com WebGL2 desativado: os tiles do mapa público e do mapa de cadastro retornaram HTTP 200, o cabeçalho `Referer` foi enviado e o User-Agent era o padrão do Firefox. As verificações Playwright da suíte interceptam tiles para repetibilidade; o smoke test independente confirmou também o serviço real durante esta sessão. Isso não é garantia de disponibilidade, SLA ou aprovação para uso público/escala. A política do tile server recomenda atribuição, requisições de navegador com cabeçalhos válidos, respeito ao cache e ausência de bulk download/prefetch; revisar a política e definir contato/provedor antes da publicação.

Referências oficiais do mapa-base: política de uso dos tiles OpenStreetMap (`https://operations.osmfoundation.org/policies/tiles/`), copyright/licença (`https://www.openstreetmap.org/copyright`) e termos do OpenFreeMap (`https://openfreemap.org/tos/`).

## Próximo gate

1. Preservar a atribuição e o registro da autorização fornecida pelo responsável; não apresentar a autorização como validação da fonte.
2. Antes de publicação/uso operacional, conferir validade topológica, atualização, cobertura e precisão do arquivo.
3. Manter “presença” separado de “controle” e “influência”; não inferir risco atual nem segurança a partir das cores.
4. Revisar comunicação, privacidade e possibilidade de contestação antes de ampliar o uso.
