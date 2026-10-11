# Mapas: desempenho e viabilidade do Google Maps

Registro do incremento anterior. A solicitação seguinte priorizou referência visual e fluidez nas engines atuais; raio inicial, paleta e distribuição foram atualizados. Estado vigente em [mapas-referencia-visual.md](mapas-referencia-visual.md) e [PLAN.md](../PLAN.md). A análise de Google permanece histórica; não foi aprovada migração.

Consulta e implementação: 11/10/2026. Escopo autorizado: frontend demonstrativo, raio e massa fictícia; análise da troca de provedor. Nenhuma migração, conta, credencial, publicação ou contratação foi executada.

## Resultado no provedor atual

- Removido o envio duplicado dos três conjuntos GeoJSON em cada atualização. Atualizações rápidas de filtro/slider agora são consolidadas em um `requestAnimationFrame`; a lista/estado Angular acompanha imediatamente o último valor.
- O mapa público permanece montado ao navegar para histórico/cadastro e voltar, conservando câmera, tiles e camadas. Trade-off: mantém memória e um contexto gráfico enquanto a aplicação está aberta; o mapa de cadastro continua sendo descartado ao sair. O descarte da aplicação remove os mapas, o observer e o quadro pendente. Inicializações concorrentes reutilizam a mesma Promise.
- `ResizeObserver` acompanha as dimensões efetivas do contêiner. Leaflet só recalcula tamanho quando as dimensões mudam, evitando deslocamento por arredondamento ao retornar à mesma tela. Arraste, controles de zoom e recuperação para raster continuam nativos.
- Comparação controlada dos métodos TypeScript anteriores/atuais, com renderizador instrumentado: 100 atualizações antes do próximo quadro geravam **700 chamadas `setData`** (200 por fonte de pontos/calor + 100 de raio); agora geram **4** (uma por fonte). Uma atualização isolada cai de sete para quatro chamadas. Script/snapshot/JSON da sessão: `/tmp/vetor-radius-baseline/`. Esse ensaio mede submissões, não FPS nem latência de rede.
- `bash harness.sh frontend`: lint, **54 testes**, build, **444,20 kB** inicial frente ao orçamento de 500 kB, sem avisos de build. Engines/CSS continuam lazy; nenhuma dependência ou versão foi adicionada.
- `npm run test:e2e -- --workers=1`: **38 passados, nenhum ignorado**, em Chromium e Firefox. Inclui clique esquerdo repetido, botão direito ignorado, arraste sem mudar centro, filtro desligado, slider/teclado/scroll até 25 km, mapa reaproveitado/câmera conservada e redimensionamento móvel. Conserva os cenários de falha/recuperação, mapa de cadastro e tiles raster reais. O teste de interação raster usa tiles simulados; o teste raster real separado continua obrigatório.

A primeira abertura ainda baixa biblioteca, worker, estilo, fontes e tiles. A recuperação com watchdog de oito segundos segue para estilo sem resposta. Nenhum ensaio controlado com Google, p95 de rede móvel, FPS em aparelho físico ou SLA foi realizado; a queixa original não foi atribuída exclusivamente à rede/GPU. Reduzimos gargalos concretos do aplicativo.

## Raio e distribuição sintética

O raio começa em 100 m na Central do Brasil e aceita até **25.000 m**, com passos de 100 m. Enquanto “Filtrar por raio” está ligado, cada clique esquerdo define o centro diretamente; segurar/arrastar move apenas a câmera. Os eventos nativos distinguem clique de arraste. Desligar a opção suspende a escolha de centro e a filtragem espacial; o último centro permanece para nova ativação. A opção explícita “Escolher centro no mapa” e coordenadas manuais continuam disponíveis. Popups de pontos/áreas cedem ao modo de escolha enquanto o raio está ligado. Não há geolocalização da pessoa.

GeoJSON mantém `[longitude, latitude]`, WGS84/SRID conceitual 4326; raio em metros, distância esférica inclusiva no cliente. Datas são instantes UTC relativos à abertura da aplicação, exibidos em `America/Sao_Paulo`. Backend/PostGIS seguem pendentes.

Há **75 ocorrências fictícias: 25 de Trânsito, 25 de Segurança e 25 de Contingência**, mais dois POIs mantidos separados. Os quatro registros anteriores foram preservados e complementados por 71. IDs e coordenadas são distintos, tipos/severidades variam, e todas as datas ficam na última semana para aparecer nos presets padrão. As novas ocorrências usam estados de histórico (`RESOLVED`/`EXPIRED`), sem inventar alertas ativos reais.

O subconjunto urbano contém Rio de Janeiro, Duque de Caxias, São João de Meriti, Nilópolis, Mesquita, Belford Roxo, Nova Iguaçu, Niterói e São Gonçalo. Pontos foram construídos em agrupamentos de bairros/centros urbanos, com pequenos deslocamentos por categoria; não foram sorteados sobre um retângulo que poderia colocar ocorrências na Baía de Guanabara. Testes verificam, por categoria, extensão entre 40 e 50 km e vizinho mais próximo a menos de 6,5 km. Zoom/arraste revelam os agrupamentos; o enquadramento inicial permanece na Central do Brasil.

**Proveniência:** fixtures autorais sintéticas criadas em 11/10/2026; sem dados pessoais, ingestão de ocorrências, geocodificação ou dataset cartográfico externo. Uso/licença segue a do repositório, sem impor nova licença. Âncoras são aproximações demonstrativas, não geometrias oficiais nem prova de pertencimento municipal por ponto-em-polígono. A referência institucional da [formação da RMRJ, IRM](https://www.rj.gov.br/irm/formacao_rjrm) confirma que os nove municípios pertencem à região de 22 municípios; foi consultada como referência textual. O subconjunto não redefine o recorte operacional Rio/Baixada nem declara cobertura total. Mancha térmica representa concentração de exemplos, sem inferência de risco.

## Viabilidade de troca

**Viável tecnicamente; recomendação: manter MapLibre/Leaflet neste incremento e realizar prova comparativa antes de decidir a migração.** Isso é proposta, não decisão de troca aprovada. Não existe evidência de que Google resolveria a latência relatada.

| Capacidade | Caminho no Google | Impacto previsto |
|---|---|---|
| Base e navegação | Maps JavaScript API | Reescrever inicialização/saúde/câmera e validar visual aproximado à identidade atual |
| Pontos e territórios | Data layer/GeoJSON | Reutilizar coordenadas/dados, adaptar estilos, interação e popups |
| Raio | `Circle`, centro e raio em metros | Manter filtro local compartilhado com lista, adaptar eventos/clique/arraste |
| Mancha térmica | Overlay próprio ou biblioteca adicional | Heatmap nativo indisponível; dependência/peso/compatibilidade precisam de ensaio |
| Cadastro | Segunda instância de mapa | Repetir suporte a coordenadas e testar uso/custos das duas instâncias |
| Falha de GPU/rede | Política de recuperação a definir | Preservar alternativa em lista e testar raster/overlay em Firefox e mobile |

A [Data layer](https://developers.google.com/maps/documentation/javascript/datalayer) aceita GeoJSON e estilos/eventos; a API de [formas](https://developers.google.com/maps/documentation/javascript/shapes) oferece círculo com raio em metros. Esses contratos permitem reaproveitar os dados, mas exigem adaptar a renderização.

A camada nativa de calor está indisponível desde maio de 2026. A documentação sugere integração como deck.gl; não foi instalada. Isso acrescenta custo de implementação e precisa passar pela mesma prova em dispositivos sem WebGL2. Fonte: [descontinuações oficiais](https://developers.google.com/maps/deprecations).

Para produção, Google exige projeto/configuração de faturamento e chave restrita. A documentação também oferece Demo Key para prototipagem sem faturamento, com recursos limitados; não validamos sua compatibilidade com todos os overlays do produto. Fonte: [configuração oficial](https://developers.google.com/maps/documentation/javascript/get-api-key). Nenhuma chave deve ser enviada no chat ou commitada; configuração de produção pertence ao responsável.

Preços globais publicados na consulta: **Dynamic Maps: 10.000 eventos mensais gratuitos; US$ 7 por mil na primeira faixa paga até 100.000**. Estimativas nessa faixa: 20.000 carregamentos/mês = US$ 70; 50.000 = US$ 280; 100.000 = US$ 630. São exemplos em dólares sem impostos/câmbio, não orçamento aprovado. Somar carregamentos do mapa público e cadastro; Places/Geocoding/Routes têm SKUs próprios se forem introduzidos. Fonte: [tabela oficial](https://developers.google.com/maps/billing-and-pricing/pricing). Rever tabela e termos na decisão/contratação.

A [política de uso/atribuição](https://developers.google.com/maps/documentation/javascript/policies) deve ser verificada junto com termos e privacidade antes da publicação. Não basta trocar a URL de tiles do provedor atual.

## Próxima decisão proposta

Se houver interesse em avançar, autorizar uma prova isolada de Google Maps que preserve o provedor atual e use chave de demonstração/configuração própria fora do Git. Comparar a mesma câmera e massa de dados nos dois provedores: 30 aberturas frias/quentes separadas, retorno por navegação, tempo filtro → resultado desenhado, arraste/zoom e fluxo de cadastro, em Chromium/Firefox e aparelho real. Medir tiles/carregamento, tamanho de download, consumo de memória/contextos e integridade visual das camadas; registrar o perfil de rede, mediana/p95 e custos previstos. Decidir migração somente após evidências e alinhamento de identidade visual/custo. O roadmap continua em `PLAN.md`.
