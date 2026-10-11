# Consolidação das branches — 11/10/2026

## Resultado e critério de escolha

A versão de continuidade passa a ser `main`, com a aplicação mais recente em `frontend/`, os dois históricos Git preservados e o material exclusivo da antiga `main` identificado. O trabalho é consolidação e documentação; não inicia backend, muda o provedor ou resolve decisões de produto pendentes.

A escolha foi feita pelo histórico e pela comparação de conteúdo, não pelo nome da branch ou somente pela data do último commit. `git fetch origin --prune`, `git log --all --graph`, `git merge-base`, `git rev-list --left-right --count` e comparação de árvores confirmaram:

| Origem no início da tarefa | Commit | Evidência |
|---|---|---|
| `origin/main` (default) | `45ddcae27ae93b7400ae4acba95f56554ba1218c` | Integração seletiva de 05/10; frontend em `vetor-urbano-web/`, documentação própria e SQL inicial |
| `origin/master` | `9574a632f6d493013228b2417234590f3de60344` | Evolução de 10/10; frontend demonstrativo completo e fallback Leaflet |
| Trabalho local sobre `master` | Snapshot `e359e22` | Melhorias de 11/10 ainda não commitadas: paleta/pins, raio, fixtures, E2E, documentação e artefatos existentes |
| Ancestral comum | `293893c4ba9d9702ea5b6d6c0bd3dcd62167b965` | As branches compartilham histórico; a afirmação anterior de independência era incorreta |

Antes da consolidação havia seis commits exclusivos da `main` e um da `master` remota. A versão mais recente da aplicação estava em `master` **mais o trabalho local**; copiar apenas a branch remota perderia essas melhorias. O snapshot local foi commitado antes do merge, sem push para `master`.

## Resolução e preservação

- Merge real com os dois pais, sem force-push ou reescrita de histórico. Backup do histórico e dos arquivos locais foi criado fora do repositório antes das edições.
- Conflitos de renomeação resolvidos mantendo uma única aplicação em `frontend/`, com código, testes, lockfile, estilo, pins, licenças e configuração exatamente iguais ao snapshot local. O README do frontend foi atualizado. `vetor-urbano-web/` foi substituído; suas versões anteriores continuam no histórico.
- `AGENTS.md` mantém as instruções atuais fornecidas para o projeto. `PLAN.md` continua sendo o único roadmap ativo.
- `docs/specs/SPEC-001-REQUIREMENTS.md`, `docs/architecture/Pipeline_Vetor_Urbano.md` e `planejamento/MODELAGEM_DB_V1.md` preservam o conteúdo da antiga `main`, com aviso de legado. `docs/PROJECT-LOG.md` e a entrada de patch notes de 05/10 foram preservados.
- `vetor-urbano-api/src/main/resources/db/migration/V1__Initial_Schema.sql` foi preservado byte a byte; é rascunho não aplicado, sem aplicação Spring Boot. Não foi executado nem modificado.
- `harness.sh` é o executor ativo; `harness/verify.sh` encaminha para ele e usa `frontend` quando chamado sem argumentos. Ambos verificam a aplicação atual; `backend`/`all` continuam bloqueados pela ausência do backend.
- As três referências originais de UI são idênticas nas duas origens e no resultado. `visuais/` e as skills de projeto foram preservados.
- MP4 de marca e arquivos existentes foram incorporados sem nova renderização. A auditoria corrigiu a alegação de fontes finais editáveis presentes; veja [vídeo de marca](video-marca.md).
- Downloads brutos de extração, CSVs/ZIP, worktrees, dependências, ambientes de ferramentas e caches permanecem locais e ignorados. Script, descrição e verificação de extração foram versionados; a camada cartográfica já usada pelo frontend foi mantida. Nenhuma nova fonte foi coletada.

## Divergências de produto registradas, sem novo contrato

| Tema | Legado da antiga `main` | Direção atual / encaminhamento |
|---|---|---|
| Escrita e publicação | Envio sem conta; `REPORTED` público após aceite pela API | Frontend-only; identidade, acesso e moderação a reconciliar em R0. Não habilitar endpoint público |
| Categorias e estados | Seis categorias em inglês e estados próprios no SQL | Três categorias demonstrativas; contratos propostos têm estados de moderação distintos. Não traduzir enums nem aplicar SQL automaticamente |
| IDs RF/RNF | Numeração própria, incluindo RF01–RF11 e RNF01–RNF10 | Preservar IDs originais RF01–RF07/RNF01–RNF08 em `docs/referencias/contextoInicial.md` e a rastreabilidade em `docs/escopo.md`; não fundir os namespaces |
| Território | Envelope metropolitano | Rio/Baixada como recorte original; nove municípios apenas nas fixtures. Limites/cobertura operacional pendentes |
| Fontes e implementação | Contrato e pipeline anteriores | `docs/escopo.md`, `docs/arquitetura.md` e `PLAN.md` descrevem a direção atual; contratos de backend ainda exigem reconciliação |

A consolidação não converte requisitos históricos em decisões novas nem comprova o aceite full-stack. As pendências permanecem no gate R0 existente.

## Verificação

Evidências estruturadas em [consolidacao-2026-10-11.json](evidencias/consolidacao-2026-10-11.json).

- `npm ci` na árvore consolidada: instalação pelo lockfile, 292 pacotes auditados, zero vulnerabilidades reportadas.
- `bash harness.sh frontend` na árvore consolidada: lint, quatro arquivos/56 testes de unidade e build de produção passaram; bundle inicial 449,26 kB, sem avisos de build. A mesma verificação havia passado sobre a versão local antes do merge.
- `bash harness.sh planning`: passou; verificação estrutural, não aceite do produto.
- `bash harness/verify.sh docs` e `bash -n harness/verify.sh`: passaram; wrapper e sintaxe conferidos.
- Auditoria de conteúdo: 49 arquivos do frontend idênticos ao snapshot local; três referências UI idênticas a ambas as branches; conteúdo histórico dos documentos exclusivos preservado; SQL e MP4 idênticos; nenhum conflito no índice.
- `ffprobe` confirmou vídeo de 15 s, 1920 × 1080, 30 fps/450 quadros, H.264/AAC estéreo; FFmpeg decodificou todo o arquivo com retorno 0.
- `CI=true npm run test:e2e -- --workers=1`: **44 passaram, zero ignorados/falhos**, em Chromium/Firefox, incluindo WebGL2, recuperação 2D, indisponibilidade dos provedores, raio, pins, teclado, telas estreitas e tiles Bright reais.
- Links locais da documentação atual válidos; busca por padrões conhecidos de credenciais não encontrou indícios nos arquivos versionados. Não equivale a auditoria completa de segurança.
- `git diff --cached --check`: passou; nenhum conflito pendente.

`bash harness/verify.sh backend` retornou **2 (bloqueado)** por Docker indisponível; a aplicação Java/banco PostGIS também não existe, portanto nenhum teste de backend foi executado. `all` não foi executado. Esses bloqueios não são sucesso de teste. Leitor de tela, aparelho físico, cobertura operacional e reprodução da composição final do vídeo continuam pendentes.

## Publicação

Consolidação publicada pelo commit de merge `fa5bff7dd15aaaf3cb19c995b9f0c30ccdb63302`. Após o push, `git fetch`/`git ls-remote` confirmaram hashes iguais de `main` local e remota; `gh repo view` confirmou `main` como default. `git merge-base --is-ancestor` confirmou que os commits originais de `main`, `master` e o snapshot local estão contidos em `origin/main`.

Só então `master` foi excluída no remoto, com conferência do SHA esperado para evitar remover uma branch alterada durante a tarefa, e removida localmente por `git branch -d`. `git ls-remote --heads origin` retornou **somente `refs/heads/main`**. O diretório principal foi colocado em `main`, com estado limpo após o merge; o worktree auxiliar existente foi preservado em HEAD destacado. O código do frontend foi conferido novamente contra o backup inicial: 49 arquivos idênticos.

Este registro de fechamento é um commit documental posterior ao merge. Depois de seu push, conferir novamente sincronização e ausência de `master`; as verificações de aplicação acima continuam válidas, pois nenhum arquivo executável do frontend foi alterado no fechamento. Não houve force-push da `main`.
