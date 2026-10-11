# Patch notes

## 2026-10-11 — Referência de fluidez, paleta clara e pins por categoria

- Referência inspecionada: Leaflet 1.9.4/CARTO Voyager. MapLibre/Leaflet mantidos; base Bright vetorial local com água azul, áreas verdes, vias claras e 32 camadas. Fallback Bright raster semelhante, sem declarar igualdade de paleta.
- Pins verde/carro, vermelho/pistola e amarelo/exclamação, borda preta/círculo branco; SVG/sprites locais com ícones Material Design Icons Apache 2.0. Popups vetoriais identificam registro por propriedade explícita.
- GPU por software identificada passa diretamente ao Leaflet, conforme comparação de arraste com a referência. Leaflet reaproveita pins/círculo entre mudanças do raio; estilo vetorial é carregado uma vez por sessão. Raio inicial 1 km, passos de 100 m e teto de 25 km.
- Segurança conserva todas as coordenadas; Trânsito/Contingência dispersos por ID em recortes urbanos em terra, a pelo menos 900 m dos demais eventos. Intervalo em uma coluna responsiva.
- `harness frontend`: lint, 56 testes, build 449,26 kB; E2E: 44 passados/zero ignorados em Firefox/Chromium. Fontes, licenças, limites e medições em `docs/mapas-referencia-visual.md`.

## 2026-10-11 — Desempenho, raio de 25 km e massa metropolitana

- Raio até 25.000 m: clique esquerdo muda o centro continuamente apenas com o filtro ligado; arraste move a câmera. Centro inicial na Central do Brasil.
- Mantém mapa público/câmera/tiles na navegação, acompanha redimensionamento e consolida alterações por quadro; elimina submissões GeoJSON duplicadas.
- 25 ocorrências fictícias por categoria (75 no total), coordenadas distintas e agrupamentos em nove municípios da RMRJ; dois POIs separados. Não declara cobertura operacional nem ocorrência real.
- `harness frontend`: lint, 54 testes, build 444,20 kB inicial; E2E: 38 passados/zero ignorados. Análise de Google Maps, fontes e limitações em `docs/mapas-desempenho-google.md`; nenhuma troca, conta ou serviço contratado.

## 2026-10-11 — Mapa-base suave e escala equivalente

- Análise do commit `9574a63`: troca de OSM raster/opacidade 0,82 por OpenFreeMap Bright vetorial + OSM raster no fallback causou diferenças visuais entre os motores.
- Alidade Smooth vetorial/raster nos mapas público e de cadastro aproxima o visual da referência; shell, controles, camadas e recuperação Firefox/Chromium preservados. CARTO Voyager exato exige chave própria; nenhuma credencial da referência foi reutilizada.
- Corrige conversão de zoom/limites entre MapLibre e Leaflet, centralização de ocorrências e enquadramento territorial; elimina créditos vetoriais duplicados. Sem novas dependências.
- `harness frontend`: lint, 49 testes, build, 440,38 kB inicial; E2E: 34 passados/zero ignorados, incluindo tiles reais e comparação da câmera nos dois motores. Firefox Playwright com janela/fallback 2D: 22 tiles HTTP 200, zero erros, cadastro nas três categorias.
- Uso sem autenticação limitado pelo Stadia Maps a localhost/127.0.0.1. Outros hosts exigem domínio autorizado/chave própria; nenhuma conta/assinatura ou publicação foi criada. Fontes, evidências e limites em `docs/compatibilidade-mapas.md`.

## 2026-10-11 — Recuperação de mapas Firefox/Chromium

- MapLibre mantém prioridade quando WebGL2 funciona. Falha de inicialização, erro antes de pronto, perda de contexto GPU e espera vetorial acima de oito segundos acionam Leaflet automaticamente nos dois mapas.
- Reutiliza raster na mesma instância após falha; conserva filtros/raio e câmera dos dois mapas, cancela watchdog ao sair e não cobre o mapa pronto por erro isolado de tile. Regressão verifica o ponto de cadastro desenhado após perda de contexto.
- Raster só anuncia prontidão após tile realmente recebido; indisponibilidade dos dois provedores mantém erro, lista e coordenadas manuais.
- `harness frontend`: lint, 49 testes e build passaram; bundle inicial 441,15 kB/limite 500 kB, engines e CSS continuam lazy. E2E: 32 passados, zero ignorados; inclui recuperação, cadastro isolado e 390/320 px nos dois renderizadores.
- Firefox instalado 157.0.1 com janela/perfil temporário validou tiles reais, marcadores e cadastro nas três categorias, sem alterar perfil pessoal/GPU. A falha original desse perfil não foi reproduzida; falhas concretas de recuperação foram reproduzidas antes da correção. Detalhes em `docs/compatibilidade-mapas.md`.
- Backend, banco, publicação e ingestão de dados continuam fora deste incremento.

## 2026-10-10 — Compatibilidade, relatório e detalhes inline

### Adicionado e corrigido
- Detalhes de ocorrência expandem dentro do próprio resultado, alternam entre abrir/fechar pelo mesmo botão e limitam a cinco registros simultâneos; detalhes de registros filtrados são removidos.
- Mapa inline na etapa “Indique o local” para as três categorias, com coordenadas editáveis e marcador sincronizado; centro inicial na Central do Brasil.
- Relatório XLSX em pt-BR com datas de Brasília, alinhamento, larguras, cabeçalhos fixos, autofiltro e impressão em paisagem.
- MapLibre/OpenFreeMap permanece como caminho principal; sem WebGL2, Leaflet 1.9.4 e CSS são carregados sob demanda. O fallback mantém pontos, popups, camadas de calor separadas, raio, polígonos filtrados e mapa de cadastro.
- O provedor raster/zoom/atribuição ficam no asset estático `frontend/public/maps/raster-provider.json`; padrão OSM, atribuição visível e link “Corrigir mapa”. Nenhuma credencial foi adicionada.
- Corrigida a pilha do mapa para controles de raio receberem clique também com Leaflet; o grupo do raio recebeu título acessível sem a legenda clipping. Espaçamento dos presets passou a 6 px e o botão “Detalhes” alinha com o ícone do registro.
- JavaScript/CSS de MapLibre e Leaflet permanecem lazy; não houve aumento do limite de bundle.

### Verificação
- `bash harness.sh frontend`: lint, 47 testes e build passaram; bundle inicial 439,56 kB (limite 500 kB), sem avisos.
- `npm run test:e2e -- --workers=1`: 15 passados, 1 ignorado. Fallback Gecko roda no projeto Firefox; testes cobrem mapas, worker/CSS, tiles de teste, raio/territórios, cadastro, detalhe até cinco, teclado, XLSX, mobile e alinhamento visual.
- Smoke test separado em Firefox 157 headless com WebGL2 desativado usou OSM real: 9 tiles no mapa público e 15 no cadastro retornaram HTTP 200; Referer/User-Agent padrão, atribuição e clique que preencheu coordenadas foram confirmados. Captura mostrou tiles contínuos.
- Build lazy: MapLibre 1,07 MB + CSS 83,13 kB; Leaflet 149,42 kB + CSS 11,07 kB; nenhum desses estilos/engines pesa no bundle inicial até a seleção do renderer.

### Limites mantidos
- Frontend demonstrativo; sem API, backend, banco, autenticação real, persistência de cadastro ou ingestão de fontes.
- A suíte E2E intercepta tiles para estabilidade; o smoke test real comprova somente a sessão atual, não disponibilidade futura/SLA. QA ainda não incluiu leitor de tela, hardware móvel real ou desempenho.

> A seção abaixo preserva o histórico anterior (estado revisado em 05/10/2026); para o estado atual, use esta atualização e `PLAN.md`.

## 2026-10-01 — Protótipo interativo do Vetor Urbano

Revisado em 05/10/2026 para refletir os testes e a configuração final do worker; a renderização do mapa em navegador segue pendente de smoke test.

### Adicionado
- Frontend demonstrativo em Angular com navegação entre mapa público e cadastro progressivo de ocorrências.
- Mapa MapLibre com carregamento sob demanda, tiles OpenStreetMap atribuídos, marcadores fictícios, popups, zoom e alternância para visualização de densidade.
- Lista acessível que acompanha os registros exibidos no mapa, filtros acumuláveis por período/categoria/tipo e pontos de interesse sintéticos.
- Formulário por categoria, campos de localização com validação de coordenadas e explicação explícita de que a API de envio ainda não existe.
- Testes de componente e scripts de lint, teste CI e build do frontend.
- Auditoria inicial das fontes cartográficas/territoriais em `docs/fontes-territoriais.md`.
- Worker MapLibre servido pelo próprio app, com o worker e seu módulo compartilhado publicados juntos sob `assets/maplibre/`; a URL é resolvida relativamente a `document.baseURI`.

### Documentação e manutenção
- README e documentos de requisitos descrevem o estado e as decisões úteis ao projeto, sem biografia ou contexto pessoal.
- Removido o prompt inicial de planejamento, já obsoleto após a Fase 0; o modo `docs` do harness verifica os arquivos atuais.

### Salvaguardas e limites
- Dados de ocorrências e pontos de interesse são fictícios e locais ao frontend; não há integração com API nem persistência.
- Nenhum polígono de território foi incorporado. Fontes, conceitos, licença e comparabilidade ainda precisam de validação.
- O formulário valida coordenadas não vazias dentro dos limites geográficos, mas não envia nem publica relatos. Autenticação, autorização no backend e moderação continuam requisitos antes de habilitar escrita.
- O mapa-base OSM serve à demonstração de baixo volume; uma publicação exige escolha de provedor apropriado e revisão dos termos.

### Verificação
- `bash harness.sh frontend`: lint, testes e build concluídos com sucesso.
- Vitest: 6 testes passaram, incluindo coordenadas vazias, o estado explícito de não envio e a ordem de definição da URL própria do worker antes da criação do mapa.
- Worker e arquivo compartilhado retornaram HTTP 200 no servidor Angular; ambos também foram incluídos no build de produção. A exclusão do prebundle não resolveu o erro e foi revertida.
- Build Angular concluído; MapLibre está em chunk lazy-loaded.
- A execução real do worker e a renderização do mapa não foram verificadas em navegador. A auditoria completa com leitor de tela também não foi feita.

### Pendências conhecidas
- Implementar a fatia vertical segura com API Java, PostgreSQL/PostGIS, autenticação/autorização e moderação.
- Definir os municípios da Baixada Fluminense e validar fontes/licenças antes de declarar cobertura ou exibir polígonos.
- Avaliar visualmente em telas móveis, zoom 200% e com leitor de tela; a captura de screenshot do navegador ficou indisponível por configuração do perfil local.
