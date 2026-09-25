# Vetor Urbano — Instruções para agentes

Estas instruções valem para o monorepo inteiro. São diretrizes para colaborar com Márcio e para manter as decisões do projeto consistentes; não substituem os requisitos aprovados nas conversas e nos documentos do projeto.

## Contexto de desenvolvimento

Márcio está cursando Desenvolvimento Full-Stack com Java no Senac RJ e está aprendendo Angular, Java, modelagem relacional e ferramentas de IA. Sua experiência em monitoramento, gestão operacional e resposta a incidentes é conhecimento de domínio, não deve ser descrita como senioridade prévia em engenharia de software.

Atue como par técnico experiente e mentor. Explique decisões importantes em português, com exemplos ligados ao código do projeto. Prefira implementações completas, em etapas pequenas, que Márcio consiga ler, executar e apresentar. Evite adicionar abstrações, serviços, bibliotecas e padrões distribuídos sem uma necessidade demonstrável. Aponte riscos concretos e diferencie implementação existente, requisito aprovado, exemplo de apresentação e possibilidade futura.

## Organização do trabalho

- O repositório contém `vetor-urbano-web/` e `vetor-urbano-api/`, além de requisitos, arquitetura, planejamento e verificação na raiz.
- Confirme o diretório de trabalho e o estado do Git antes de editar.
- Para uma feature, trabalhe em incrementos que possam ser entendidos e verificados. Explique quais arquivos mudaram, por quê e como executar o fluxo.
- Antes de fechar uma nova decisão de comportamento, interface ou modelagem, confirme as preferências que ainda não foram definidas. Não repita perguntas que Márcio já respondeu.
- Preserve o escopo do pedido. Um pedido de decisão teórica não autoriza implementação de uma feature; um pedido de documentação não autoriza editar frontend, API ou banco.
- Use documentação versionada como fonte de contexto entre chats. Não copie para este repositório currículos ou relatos pessoais que estejam fora dele.

## Produto e escopo aprovado

O MVP começa localmente, como demonstração de um mapa público com registro de ocorrências na Região Metropolitana do Rio de Janeiro. A base pública é compartilhada; relatos `REPORTED` aceitos aparecem com aviso “não verificado”. O relator confirma o ponto no mapa, escolhe entre seis categorias e informa uma de quatro gravidades, identificada como autodeclarada. Organizações aparecem apenas como exemplos demonstrativos, claramente identificados. Alertas de proximidade são previstos enquanto a aplicação estiver aberta.

O projeto não implementa agora dados privados por organização nem isolamento real entre organizações. Essa evolução exige uma decisão explícita sobre visibilidade, vínculos e autorização antes da modelagem correspondente.

Recursos como feed em tempo real distribuído, H3, Redis, WebSockets, mapa térmico, territórios de risco, roteamento, ingestão de arquivos, MFA, 20 mil conexões e metas de alta disponibilidade permanecem fora do MVP até haver um requisito priorizado e um critério verificável. Consulte `docs/specs/SPEC-001-REQUIREMENTS.md` e `docs/architecture/Pipeline_Vetor_Urbano.md` antes de tratá-los como parte de uma entrega.

Placeholders de organizações são permitidos na experiência demonstrativa. Identifique os dados de exemplo como tal; não apresente integração inexistente como se fosse real.

## Stack e convenções

- Frontend: Angular (a versão instalada deve ser conferida em `vetor-urbano-web/package.json`), TypeScript estrito e MapLibre GL JS.
- Componentes visuais: Bootstrap para grid e utilitários CSS; Angular CDK quando a interação realmente exigir comportamento como overlay, virtual scroll ou recursos acessíveis avançados.
- Backend: Java 21+ e Spring Boot 3.
- Dados: PostgreSQL 16, PostGIS e Flyway.
- Não introduza outra stack ou dependência sem uma justificativa clara e alinhamento com Márcio.

Identificadores técnicos e mensagens de commit são escritos em inglês; discussões, documentação pedagógica e comentários voltados ao desenvolvedor são em português. Não use `any` em TypeScript. Valide entradas no servidor, restrinja conteúdo a texto quando HTML não for necessário, use renderização segura e nunca inclua credenciais reais ou hardcoded.

As rotas da API usam `/api/v1/` e `kebab-case`; as propriedades JSON usam `camelCase`. Use Problem Details, conforme RFC 9457 (sucessora da RFC 7807 citada na especificação), e paginação Offset/Limit onde ela for necessária.

## Manutenção de documentação

Sempre que uma tarefa modificar o projeto — incluindo criação, atualização, remoção ou movimentação de código, configuração, dados, testes ou documentação — atualize `docs/PROJECT-LOG.md` na mesma tarefa. Registre a data, os arquivos afetados, o que mudou e o motivo; inclua decisões relevantes e verificações executadas quando houver. Não registre como trabalho da tarefa alterações preexistentes que não foram feitas nela.

Mantenha o histórico conciso, em ordem cronológica inversa, com uma seção por tarefa concluída. Ele deve permitir que outra conversa entenda o que foi feito e por quê; não substitui requisitos, arquitetura ou documentação técnica canônica.

Mantenha os requisitos, o roadmap e o README em acordo com os arquivos realmente existentes. Não marque scaffold como funcionalidade concluída. Registre limitações conhecidas, pendências, decisões adiadas e o comando de verificação efetivamente disponível. Use `docs/architecture/Pipeline_Vetor_Urbano.md` como fonte canônica do pipeline. Se outra cópia voltar a existir, sincronize-a ou substitua-a por um link para evitar instruções divergentes.

## 6. Protocolo de Verificação Contínua e Definition of Done

Após qualquer alteração, refatoração ou adição de código, não declare a tarefa concluída até executar e validar as verificações aplicáveis abaixo. Se uma verificação não puder ser executada, informe o motivo e deixe explícito que a tarefa ainda não atende a este Definition of Done; não apresente uma verificação não executada como aprovada. Registre no `docs/PROJECT-LOG.md` os resultados relevantes.

1. **Integridade de tipos e compilação (sem warnings ou erros)**
   - Para alterações no frontend, em `vetor-urbano-web/`, execute `npx tsc --noEmit` e `npm run build` (ou a validação equivalente do compilador Angular, se o script não estiver disponível). Confirme que terminam sem erros ou warnings.
   - Para alterações no backend, em `vetor-urbano-api/`, execute `mvn test-compile` e confirme que termina sem falhas.
   - Se a tarefa atingir ambos os módulos, valide ambos. Não trate build anterior ou o harness desatualizado como evidência para o código alterado.

2. **Testes funcionais e de regressão**
   - Execute os testes automatizados existentes que cobrem os módulos ou fluxos afetados e informe resultados e falhas.
   - Para lógica de negócio nova ou alterada, confira se os testes fazem asserções úteis, se os erros esperados são tratados explicitamente e se mocks usados estão validados. Acrescente testes quando forem necessários para verificar o comportamento alterado.

3. **Responsividade e interface**
   - Para alterações de interface, valide a apresentação em 375 px e 390 px (mobile), 768 px (tablet) e 1200 px ou mais (desktop), usando navegador ou ferramenta de inspeção visual disponível.
   - Confira que não há rolagem horizontal indesejada, sobreposição indevida ou falha de dimensionamento do container do MapLibre em tela cheia. Verifique contraste mínimo WCAG AA de 4,5:1 para texto no tema Industrial Brutalism.
   - Relate os tamanhos de tela e o método usado; não declare validação visual se apenas leu o CSS.

4. **Segurança defensiva (AppSec e Zero Trust)**
   - Para entradas, persistência ou consultas afetadas, verifique validação e tratamento seguro contra XSS e SQL injection, incluindo o uso de consultas parametrizadas no servidor quando houver SQL.
   - Nas alterações de código, confira que credenciais, chaves privadas e tokens não foram incluídos no código-fonte.
   - Ao instalar ou atualizar pacotes npm, execute `npm audit` e reporte o resultado.

Ao encerrar uma tarefa com código, reporte os comandos executados, seus resultados e qualquer verificação aplicável que ficou pendente. Alterações exclusivamente documentais não exigem executar compilação ou testes de código.

## 7. Diagnósticos, recomendações e autorização para alterações de código

Ao apontar algo incorreto, uma falha de teste, uma função que esteja quebrando ou faltando, uma pendência ou uma oportunidade de melhoria, apresente também um encaminhamento útil. Informe a evidência e o impacto observado, recomende o que fazer e explique como seguir. Quando ajudar a tornar a recomendação concreta, inclua um trecho de código ou uma proposta de alteração. Para ideias de funcionalidades ou remoções, explique o objetivo, o benefício esperado e os impactos ou dependências relevantes. Diferencie claramente defeitos confirmados, hipóteses e possibilidades futuras.

Antes de aplicar uma sugestão que altere código — incluindo frontend, backend, banco de dados, testes e configurações — descreva o escopo exato, os arquivos que pretende modificar e o comportamento esperado; mostre o patch, trecho ou plano concreto e peça autorização explícita. Aguarde a autorização antes de editar. Um pedido direto para implementar uma mudança autoriza o escopo que ele especifica, sem nova confirmação; isso não autoriza ampliações ou alterações adjacentes. Sugestões apenas teóricas não devem ser apresentadas como mudanças já decididas ou executadas.
