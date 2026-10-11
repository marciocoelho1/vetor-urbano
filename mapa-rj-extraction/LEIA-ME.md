# Extração do mapa Dados de Riscos

Fonte: https://dadosderiscos.com.br/mapa-rj-risco-faccoes.html
Extração: 2026-10-10T09:58:33.147610-03:00
Data-base declarada pela página: julho de 2026.

## Conteúdo
- poligonos-original.geojson: FeatureCollection original embutida no script zonas, sem alteração.
- poligonos-com-informacoes.geojson: mesmas geometrias, campos originais n e f e informações do registro FAC e do popup em português.
- poligonos.csv: uma linha por polígono, incluindo todas as coordenadas como JSON.
- vertices.csv: uma linha por par de coordenadas, com identificação do polígono, anel e vértice.
- verificacao.json: totais, verificações e hash da página.
- source.html: página obtida, preservada como evidência.
- extract.py: script reexecutável sobre source.html, apenas com a biblioteca padrão Python.

## Totais
1671 polígonos; 49294 pares de coordenadas, incluindo pontos repetidos de fechamento; 1671 anéis.

## Campos e coordenadas
Na fonte, n significa nome da área e f significa código da classificação. São os únicos atributos por polígono. O restante foi recuperado do registro de grupos e do modelo de popup da própria página. Não há município, endereço, histórico ou data individual de atualização nos atributos originais.
A ordem das coordenadas é [longitude, latitude], em graus decimais. Os anéis foram preservados, inclusive fechamento e possíveis repetições. Não foi reprojetado, arredondado ou simplificado. O ID de extração é sequencial, criado para relacionar os arquivos; não é identificador do site.
O campo incluídaNoAlertaDoSite reproduz a configuração risk da página, não uma avaliação independente de risco.
Os CSVs usam separador ponto e vírgula e UTF-8 com BOM. Importe-os como dados, mantendo campos de texto como texto.

## Limitações
O mapa declara que a informação pode estar desatualizada ou imprecisa e não é uma afirmação oficial nem acusação contra moradores ou estabelecimentos. A extração reproduz o conteúdo da fonte, sem confirmar domínio territorial ou precisão geográfica.
A integridade básica foi conferida; não foi executada validação topológica. Registros repetidos não foram removidos.
A inspeção no navegador não pôde ser executada porque o navegador padrão configurado não é Chromium compatível. A extração foi feita diretamente do JSON embutido na página, junto com a inspeção do código que gera os popups e camadas.
