# Patch notes

## 2026-10-05 — Integração seletiva na `main`

### Integrado
- Incorporada a demonstração Angular à aplicação existente em `vetor-urbano-web/`, preservando o esquema SQL, os requisitos, a documentação arquitetural e a estrutura planejada para a API já presentes na `main`.
- Atualizados os READMEs para descrever o mapa, filtros, lista alternativa e formulário como demonstração com dados sintéticos, sem consulta, envio ou persistência.
- Ajustado `harness/verify.sh` para executar lint, checagem de tipos, testes e build no frontend existente; a ausência de aplicação Spring Boot é informada como estado, não tratada como teste aprovado.
- Registrados o escopo da integração, a auditoria territorial e os limites de verificação na documentação do projeto.

### Verificação
- `bash -n harness/verify.sh` e `bash harness/verify.sh`: passaram; lint, typecheck, 6 testes, build de produção e verificações estruturais/segurança concluídos. O harness informa que a API ainda não está scaffoldada.
- `npm audit --audit-level=low`: zero vulnerabilidades.
- Worker e módulo compartilhado do MapLibre retornaram HTTP 200 no servidor local. Uma requisição de tile OSM também retornou HTTP 200; isso não comprova a renderização do mapa no navegador.
- Capturas headless em 375, 390, 768 e 1200 px não mostraram overflow horizontal óbvio no estado inicial. O formulário foi inspecionado no preview em desktop.

### Limite conhecido
- Na captura desktop, os controles e a atribuição do MapLibre apareceram, mas tiles e marcadores não ficaram visíveis. A renderização do mapa/worker em navegador com WebGL funcional e a validação responsiva do formulário continuam pendentes; não declarar essa fase concluída.
- O placeholder `#777780` sobre o campo `#111115` mede 4,25:1, abaixo do mínimo WCAG AA de 4,5:1 para texto. O ajuste de cor permanece pendente.

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
