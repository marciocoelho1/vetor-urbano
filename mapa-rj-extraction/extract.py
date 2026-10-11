from pathlib import Path
import re, json, csv, collections, hashlib, zipfile, datetime, math

ROOT = Path(__file__).parent
SOURCE = 'https://dadosderiscos.com.br/mapa-rj-risco-faccoes.html'
html = (ROOT / 'source.html').read_text()
match = re.search(r'<script\b[^>]*id="zonas"[^>]*>(.*?)</script>', html, re.S)
assert match, 'Dados zonas ausentes'
data = json.loads(match.group(1))
app = next(b for a,b in re.findall(r'<script\b([^>]*)>(.*?)</script>', html, re.S) if 'var FAC = {' in b)
registry = {}
for code, label, color, risk in re.findall(r"(\w+):\s*\{label:'([^']+)',\s*color:'([^']+)',\s*risk:(true|false)\}", app):
    registry[code] = {'label': label, 'color': color, 'risk': risk == 'true'}
assert len(registry) == 7
features = data['features']
counts = collections.Counter()
issues = []
rows = []
vertices = []
enriched = []
seen = collections.Counter()
for index, feature in enumerate(features, 1):
    props = feature['properties']
    geometry = feature['geometry']
    assert geometry['type'] == 'Polygon'
    assert props['f'] in registry
    group = registry[props['f']]
    counts[props['f']] += 1
    seen[json.dumps(feature, sort_keys=True)] += 1
    popup = ('Área neutra (sem domínio registrado)' if props['f'] == 'NEU' else 'Presença: ' + group['label'])
    total = 0
    for ring_index, ring in enumerate(geometry['coordinates'], 1):
        if len(ring) < 4 or ring[0] != ring[-1]:
            issues.append({'id': index, 'ring': ring_index, 'issue': 'anel curto ou não fechado'})
        for vertex_index, coord in enumerate(ring, 1):
            assert len(coord) == 2 and all(isinstance(x, (int, float)) and math.isfinite(x) for x in coord)
            lon, lat = coord
            assert -180 <= lon <= 180 and -90 <= lat <= 90
            vertices.append([index, props['n'], props['f'], ring_index, vertex_index, lon, lat])
            total += 1
    extra = {'extractionId': index, **props, 'nome': props['n'], 'classificacao': group['label'], 'cor': group['color'], 'incluidaNoAlertaDoSite': group['risk'], 'textoPopup': popup, 'fontePopup': 'Informação pública compilada · base jul/2026', 'dataBaseInformada': '2026-07', 'fonteUrl': SOURCE}
    enriched.append({'type': 'Feature', 'properties': extra, 'geometry': geometry})
    rows.append([index, props['n'], props['f'], group['label'], group['color'], group['risk'], popup, 'Informação pública compilada · base jul/2026', '2026-07', len(geometry['coordinates']), total, json.dumps(geometry['coordinates'], ensure_ascii=False, separators=(',', ':'))])
(ROOT / 'poligonos-original.geojson').write_text(match.group(1), encoding='utf-8')
(ROOT / 'poligonos-com-informacoes.geojson').write_text(json.dumps({'type': 'FeatureCollection', 'features': enriched}, ensure_ascii=False, indent=2), encoding='utf-8')
for filename, header, records in [
    ('poligonos.csv', ['idExtracao','nome','codigo','classificacao','cor','incluidaNoAlertaDoSite','textoPopup','fontePopup','dataBaseInformada','quantidadeAneis','quantidadeParesCoordenadas','coordenadasGeoJSON'], rows),
    ('vertices.csv', ['idExtracao','nome','codigo','anel','vertice','longitude','latitude'], vertices),
]:
    with (ROOT / filename).open('w', encoding='utf-8-sig', newline='') as out:
        writer = csv.writer(out, delimiter=';')
        writer.writerow(header)
        writer.writerows(records)
report = {'sourceUrl': SOURCE, 'extractedAt': datetime.datetime.now().astimezone().isoformat(), 'sourceSha256': hashlib.sha256((ROOT / 'source.html').read_bytes()).hexdigest(), 'features': len(features), 'coordinatePairsIncludingClosingPoints': len(vertices), 'rings': sum(len(f['geometry']['coordinates']) for f in features), 'counts': dict(counts), 'exactDuplicateFeatures': sum(n-1 for n in seen.values()), 'ringIssues': issues, 'checks': ['Todos os registros extraídos; nenhum filtro por grupo', 'Coordenadas preservadas numericamente sem simplificação', 'Todos os pares têm duas coordenadas finitas dentro dos limites geográficos', 'Classificações conferidas com o registro FAC da página', 'Não foi executada validação topológica de interseções, sobreposições ou orientação dos anéis']}
(ROOT / 'verificacao.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
readme = f'''# Extração do mapa Dados de Riscos

Fonte: {SOURCE}
Extração: {report['extractedAt']}
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
{len(features)} polígonos; {len(vertices)} pares de coordenadas, incluindo pontos repetidos de fechamento; {report['rings']} anéis.

## Campos e coordenadas
Na fonte, n significa nome da área e f significa código da classificação. São os únicos atributos por polígono. O restante foi recuperado do registro de grupos e do modelo de popup da própria página. Não há município, endereço, histórico ou data individual de atualização nos atributos originais.
A ordem das coordenadas é [longitude, latitude], em graus decimais. Os anéis foram preservados, inclusive fechamento e possíveis repetições. Não foi reprojetado, arredondado ou simplificado. O ID de extração é sequencial, criado para relacionar os arquivos; não é identificador do site.
O campo incluídaNoAlertaDoSite reproduz a configuração risk da página, não uma avaliação independente de risco.
Os CSVs usam separador ponto e vírgula e UTF-8 com BOM. Importe-os como dados, mantendo campos de texto como texto.

## Limitações
O mapa declara que a informação pode estar desatualizada ou imprecisa e não é uma afirmação oficial nem acusação contra moradores ou estabelecimentos. A extração reproduz o conteúdo da fonte, sem confirmar domínio territorial ou precisão geográfica.
A integridade básica foi conferida; não foi executada validação topológica. Registros repetidos não foram removidos.
A inspeção no navegador não pôde ser executada porque o navegador padrão configurado não é Chromium compatível. A extração foi feita diretamente do JSON embutido na página, junto com a inspeção do código que gera os popups e camadas.
'''
(ROOT / 'LEIA-ME.md').write_text(readme, encoding='utf-8')
assert json.loads((ROOT / 'poligonos-original.geojson').read_text()) == data
assert len(json.loads((ROOT / 'poligonos-com-informacoes.geojson').read_text())['features']) == len(features)
for filename, expected in [('poligonos.csv', len(features)), ('vertices.csv', len(vertices))]:
    with (ROOT / filename).open(encoding='utf-8-sig', newline='') as inp:
        parsed = list(csv.reader(inp, delimiter=';'))
        assert len(parsed) - 1 == expected
archive = ROOT / 'mapa-rj-poligonos.zip'
files = ['poligonos-original.geojson','poligonos-com-informacoes.geojson','poligonos.csv','vertices.csv','verificacao.json','LEIA-ME.md','source.html','extract.py']
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as out:
    for name in files:
        out.write(ROOT / name, name)
with zipfile.ZipFile(archive) as inp:
    assert inp.testzip() is None
    assert len(inp.namelist()) == len(files)
print(json.dumps(report, ensure_ascii=False, indent=2))
print('ARCHIVE', archive, 'BYTES', archive.stat().st_size)
