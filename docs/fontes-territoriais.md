# Auditoria de fontes cartográficas e territoriais

Atualizado em 01/10/2026. Esta auditoria registra a triagem dos endereços indicados; não autoriza reutilização de geometrias nem valida as alegações territoriais.

## Mapa de presença — Dados de Riscos

- Página consultada: `https://dadosderiscos.com.br/mapa-rj-risco-faccoes.html`.
- O mapa se identifica como informativo e baseado em fontes públicas. Exibe data-base **julho de 2026**, **1.671 áreas mapeadas** e sete grupos/categorias: CV, TCP, ADA, milícias, Liga da Justiça, milícia de Nova Iguaçu e área neutra.
- A própria descrição ressalva que presença mapeada não é afirmação oficial, que a dinâmica territorial muda e que podem existir imprecisões. Esses nomes e contagens são declarações da fonte, não dados verificados pelo Vetor Urbano.
- Na página consultada não foi localizado arquivo de geometrias para download nem licença explícita de reutilização dos polígonos. “Acesso aberto” à página não é tratado como licença de redistribuição.

## Mapa Histórico — GENI/UFF e Instituto Fogo Cruzado

- Página do mapa indicada: `https://fogocruzado.org.br/mapadosgruposarmados/`.
- Artigo de apresentação da versão 2025: `https://fogocruzado.org.br/relatorios/mapa-historico-dos-grupos-armados-expoe-reorganizacao-territorial-do-crime-no-rio/` (publicado em 04/12/2025; resultados descritos referem-se a 2024).
- A metodologia publicada descreve denúncias anônimas do Disque Denúncia, geocodificação, classificação algorítmica, validação por imprensa/literatura especializada e shapefile refinado à escala censitária. A análise separa **controle** de **influência**, conceitos distintos de “presença mapeada”.
- A página interativa não expôs, na consulta realizada, um arquivo de polígonos ou uma licença de redistribuição que permita comparar geometrias. A matéria e o mapa permitem contextualização metodológica, mas não um cruzamento espacial reprodutível.

## Comparabilidade e decisão para a demonstração

As fontes usam conceitos, métodos e datas diferentes. Contagens ou nomes parecidos não demonstram que dois polígonos representam a mesma área; a classificação “presença” não pode ser convertida automaticamente em controle/influência. Não calcular interseção, união ou equivalência espacial sem os arquivos originais, sistemas de referência, data de cada geometria e autorização de uso.

**Decisão reversível desta entrega:** não ingerir nem desenhar polígonos territoriais. O módulo existe na interface, mas informa que a camada está indisponível enquanto proveniência, arquivo, licença, data e regras de atribuição estiverem em validação. “Área neutra” permanece rótulo solicitado, não afirmação independente de neutralidade. Reabrir esta decisão somente após obter os dados diretamente dos responsáveis e revisão de conteúdo/risco.

## Mapa-base demonstrativo

O frontend usa tiles raster `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, com atribuição visível. É apenas um mapa-base; não fornece ocorrências, polígonos de risco ou validação territorial. A política oficial exige atribuição, cache conforme os cabeçalhos, requisições normais da área visualizada e proíbe prefetch/download em massa; o serviço é best-effort, sem SLA. Antes de disponibilizar o produto além de uma demonstração de baixo volume, escolher e documentar provedor/infraestrutura adequada, termos, privacidade, limites e atribuição.

Fonte da política: `https://operations.osmfoundation.org/policies/tiles/`.

## Próximo gate

1. Solicitar aos responsáveis os arquivos vetoriais originais e licença/permissão de reutilização.
2. Registrar sistema de referência, precisão, cobertura, data-base, metodologia e limitações de cada versão.
3. Construir comparação espacial reproduzível sem misturar “presença”, “controle” e “influência”.
4. Submeter rótulos e comunicação a revisão de segurança/privacidade antes de habilitar polígonos em qualquer ambiente.
