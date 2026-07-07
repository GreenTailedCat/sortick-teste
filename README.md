# Sortick Teste v1.16 — formulários e dados

Esta versão é a entrega consolidada para o repositório de testes.

## Inclui

- Formulário de detalhes para Nomes, Roleta, Bingo, Grupos e Decisões rápidas: nome, descrição, data e observação; editável depois.
- Cartela em 3 etapas com descrição, data, imagem de destaque, valor, observação e até 10 prêmios.
- Prêmios únicos ou repetíveis, com sorteio separado e histórico de vencedores.
- Barra de preenchimento da cartela e progresso do Bingo.
- Dados interativos locais: D4, D6, D8, D10, D12 e D20; até 10 dados, resultados individuais, total, rolar e limpar.
- Cara ou coroa com resultado visual.
- Número aleatório com repetição opcional e reinício de sequência.
- Carrossel sem barra horizontal nativa e rodapés organizados.
- Páginas Como funciona, Ideias de uso e Perguntas frequentes.

## Ambiente

É uma cópia de testes: usa `/sortick-teste/`, mantém `noindex`, Analytics/PWA de teste desativados e dados locais isolados da produção.

## Decisão técnica do modo Dados

O modo Dados é uma implementação local em SVG/CSS/JavaScript, sem API, CDN ou serviço externo. A escolha evita tornar um site estático dependente de build npm, assets externos ou disponibilidade de terceiros. A interação é inspirada na experiência de mesas de dados: seletor de D4 a D20, até 10 dados, resultado em cada dado e total.


## v1.16 — formulários e dados

- Nomes, Roleta, Bingo e Grupos usam um assistente em três etapas: atividade, imagem e configuração.
- Decisões rápidas permanecem diretas: sem nome, descrição, data ou imagem obrigatórios.
- Imagem opcional disponível para Nomes, Roleta, Bingo e Grupos; também pode ser editada depois.
- Correção do primeiro desenho do modo Dados: a mesa aparece diretamente, sem painel de participantes e sem estado genérico.
- Dados mantêm limite de 10 unidades por rodada, resultado em cada dado, total, rolar e limpar.


## v1.17 — correção de criação e modo Dado

- Formulário de Nomes, Roleta, Bingo e Grupos usa a mesma estrutura visual de 3 etapas da cartela.
- Corrigidos botões Continuar, imagem e observação desses modos.
- Decisões rápidas continuam diretas, sem formulário de atividade.
- Dado não usa nem exibe participantes.
