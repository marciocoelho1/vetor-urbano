## 1. Objetivo e diretrizes do produto

O Vetor Urbano propõe consulta e análise geográfica de incidentes, acidentes e outras ocorrências, com possibilidade de evolução para colaboração e alertas. A primeira versão deve priorizar consulta e análise; recursos colaborativos e alertas dependem de validação de escopo, segurança e viabilidade.

O produto deve combinar fontes de dados e permitir filtros temporais e geográficos, visualização cartográfica e exportação conforme licenças e contratos que venham a ser aprovados. Essa referência funcional não autoriza copiar marca, interface, dados ou implementação de terceiros.

- Stack prevista: Angular com SCSS, Java e PostgreSQL; avaliar PostGIS para consultas espaciais.
- Recorte inicial: cidade do Rio de Janeiro e Baixada Fluminense; a lista de municípios e limites ainda precisa ser definida.
- Usar dados fictícios identificados como demonstração até que fontes, licenças e regras de publicação sejam verificadas.
- Preservar a direção visual própria do Vetor Urbano, com atenção a acessibilidade, responsividade e manutenção.

## 2. Requisitos originais

- **RF, RNF e RN inciais:**

Requisitos Funcionais.

RF01 - Registro Georreferenciado de Incidentes:
O sistema deve permitir o cadastro de incidentes, acidentes e ocorrências informando coordenadas geográficas (latitude/longitude ou ponto no mapa), data/hora, categoria (ex.: furto, tiroteio, colisão viária, alagamento) e nível de severidade.

RF02 - Visualização Cartográfica e Filtros Dinâmicos:
O sistema deve exibir um mapa interativo com marcadores e mapas de calor (heatmaps) das ocorrências, permitindo que o usuário filtre os dados por raio de proximidade (ex.: 1 km, 5 km), faixa de horário e tipo de incidente.

RF03 - Alertas Proativos por Cerca Virtual (Geofencing):
O sistema deve disparar notificações push em tempo real para os dispositivos de usuários que entrarem em um perímetro ativo de risco previamente configurado ou detectado.

RF04 - Validação Comunitária e Confirmação de Status:
O sistema deve permitir que os usuários votem na validade de um incidente reportado (opções como "Ainda acontecendo", "Via liberada" ou "Informação incorreta"), recalculando automaticamente a pontuação de relevância do alerta.


RF05 – Controle de Acesso Baseado em Funções (RBAC):
O sistema deve autenticar os usuários e carregar dinamicamente a interface e as permissões de acordo com o perfil atribuído (Gestor, Operador ou Usuário).

RF06 – Gestão de Operadores e Contas:
O sistema deve permitir que o perfil Gestor crie, ative, inative e redefina permissões de contas de Operadores.

RF07 – Moderação de Incidentes:
O sistema deve disponibilizar uma fila de moderação de ocorrências exclusivamente para os perfis Operador e Gestor.

3. Requisitos Não Funcionais
RNF01 - Baixa Latência na Atualização do Mapa:
A renderização inicial dos marcadores no mapa e a resposta às consultas de incidentes em um raio de até 5 km não devem ultrapassar 1,5 segundos em conexões móveis 4G.

RNF02 - Anonimização de Dados e Privacidade (LGPD):
O sistema não deve expor a identidade, número de telefone ou localização residencial exata do usuário denunciante. Denúncias de incidentes criminais devem ser desacopladas de identificadores pessoais no banco de dados.

RNF03 - Alta Disponibilidade (High Availability):
A infraestrutura de ingestão e distribuição de alertas críticos deve manter um índice de disponibilidade de no mínimo 99,9% (uptime), garantindo tolerância a falhas durante picos de acessos em situações de crise urbana.

RNF04 - Escalabilidade Concorrente via Mensageria:
A arquitetura do backend deve suportar a transmissão simultânea de mensagens via WebSockets/SSE para pelo menos 20.000 conexões ativas sem degradação no tempo de entrega das notificações.

RNF05 - Usabilidade e Desempenho Visual (Taxa de Quadros):
A interface do mapa vetorial deve manter uma taxa de renderização estável de pelo menos 30 quadros por segundo (fps) durante interações contínuas de arrastar (pan) e aplicar zoom no dispositivo móvel.

RNF06 – Armazenamento Seguro de Credenciais:
As senhas dos usuários e operadores devem ser protegidas no banco de dados utilizando algoritmos de derivação de chave com salt (como Argon2id ou Bcrypt com fator de custo adequado).

RNF07 – Gerenciamento e Expiração de Sessão:
Sessões ativas dos perfis Gestor e Operador devem utilizar autenticação baseada em tokens com expiração máxima de 1 hora de inatividade e suporte a revogação imediata.

RNF08 – Autenticação Multifator (MFA):
O acesso ao painel com perfil de Gestor deve exigir obrigatoriamente um segundo fator de autenticação (MFA via app autenticador ou SMS).

Outras funcionalidades que não consegui pensar em RN, RF e RNF;
Mancha Térmica: para cada categoria de inserções (incidentes, acidentes e ocorrẽncias).
Quando o Gestor, Operador ou Usuário selecionarem uma categoria para visualizar os pins de cada inserção no mapa, ele poderá ter a opção de ligar a Mancha Térmica, assim acessando um novo tipo de leitura dos dados selecionados.
Áreas Dominadas: ao selecionar esta funcionalidade, o Gestor, Operador ou Usuário visulizarão no mapa os polígonos das áreas domindas por Facções Criminosas ou Milícias. Função muito similiar ao Onde Tem Tiroteio e outros aplicativos. E existe um banco de dados aberto com .XML dos polígonos destas áreas no estado do Rio de Janeiro.

Outro ponto muito importante; até o projeto realmente tomar corpo e ser algo funcional (pós baterias de testes), nos limitaremos a Região Metropolitana do Rio de Janeiro, mais específicamente a cidade do Rio de Janeiro e Baixada Fluminense.
