# Sortick Teste v1.14 — pacote completo

Versão preparada para abertura pública do domínio `sortick.com.br`.

## Mudanças

- Removido `noindex` das páginas HTML
- `robots.txt` agora permite indexação
- Adicionado `sitemap.xml`
- Adicionadas tags `canonical` apontando para `https://sortick.com.br`
- Adicionado redirecionamento da URL técnica do GitHub Pages para o domínio oficial
- Adicionada estrutura de Analytics em `js/analytics.js`
- Eventos básicos preparados:
  - criar sorteio
  - iniciar sorteio
  - copiar resultado
  - compartilhar resultado
  - baixar imagem

## Analytics

O Google Analytics está ativo com o ID:

```text
G-9D20N8TF1J
```

Eventos básicos preparados:

- criar sorteio
- iniciar sorteio
- copiar resultado
- compartilhar resultado
- baixar imagem

## Importante

Antes de AdSense, revise as páginas:

- Sobre
- Privacidade
- Termos

E confirme que o domínio está com HTTPS funcionando.


## v1.8.1-analytics

- Google Analytics ativado com o ID `G-9D20N8TF1J`.
- Política de Privacidade atualizada com menção ao uso do Google Analytics.


## v1.8.2-termos

- Ajustado o texto da seção “Mudanças futuras” nos Termos.
- Removida listagem específica de recursos futuros.
- Texto ficou mais geral, indicando que o Sortick pode mudar e que os termos podem ser atualizados.


## v1.8.3-termos-curto

- Texto da seção “Mudanças futuras” dos Termos reduzido para uma frase simples.


## v1.8.4-adsense

- Snippet do Google AdSense adicionado ao `<head>` das páginas públicas.
- Política de Privacidade atualizada com menção ao Google AdSense e anúncios.


## v1.8.5-urls-limpas

- Páginas públicas reorganizadas para URLs sem `.html`.
- Links internos atualizados para `/`, `/sobre/`, `/termos/`, `/privacidade/`, `/sorteio/`.
- Sitemap e canonical atualizados para URLs limpas.
- Redirects simples adicionados para links antigos `.html`.


## v1.8.6-corrigir-caminhos

- Corrigidos caminhos de CSS, JavaScript, ícones e manifest em páginas com URLs limpas.
- Páginas em `/sobre/`, `/termos/`, `/privacidade/`, `/sorteio/` e `/offline/` agora carregam assets pela raiz.


## v1.8.7-urls-limpas-final

- Adicionado script global para normalizar URLs antigas `.html`.
- Corrigidos links de cabeçalho e âncoras para `/`, `/#modos` e `/#criar`.
- Service worker ajustado para não prender páginas HTML antigas em cache.
- Redirects `.html` reforçados para URLs limpas.


## v1.8.8-corrigir-logo

- Corrigidos caminhos relativos de imagens/logo em páginas com URLs limpas.
- Logo dentro da página de sorteio agora carrega assets pela raiz do domínio.


## v1.9-seo-modos
- Adicionadas páginas fixas por modo para SEO:
  - `/sorteio-por-nomes/`
  - `/roleta/`
  - `/cartela-de-rifa/`
  - `/bingo/`
  - `/grupos/`
- Sitemap atualizado.
- Cada página recebeu title, meta description e canonical.
- Botões das páginas abrem a criação com o tipo de sorteio selecionado.


## v1.9.1-carrossel-modos

- Seção “Modos disponíveis” da página inicial transformada em carrossel horizontal.
- Adicionadas setas laterais para navegar pelos modos.
- Reincluído o card Grupos/Times na página inicial.


## v1.9.2-corrigir-carrossel

- Corrigido carrossel de modos para não quebrar em duas linhas.
- Adicionado CSS crítico na página inicial para evitar cache antigo do PWA.
- Adicionado cache busting em CSS/JS da home.


## v1.10-sorteios-salvos

- Adicionado painel “Continuar um sorteio” na página inicial.
- Sorteios já eram salvos localmente no navegador; agora o usuário consegue visualizar, continuar e excluir sorteios salvos.
- Salvamento continua local, sem login, sem banco de dados e sem sincronização entre dispositivos.


## v1.10.1-corrigir-cabecalho

- Corrigido o cabeçalho das páginas dos modos.
- As páginas SEO agora usam a mesma logo e navegação da página inicial.


## v1.10.2-lote-interface

Atualizações de interface e textos, sem mudança na lógica dos sorteios:

- Mantida a correção do cabeçalho das páginas dos modos.
- “Reportar erro” passou a ser “Erro/sugestões?”.
- E-mail de feedback ajustado para aceitar erros e sugestões.
- “Novo sorteio nesta lista” passou a ser “Sortear novamente”.
- O botão de sortear novamente deixou de usar estilo de perigo.
- Adicionada explicação de que a ação mantém a lista.
- “Novo sorteio” passou a ser “Criar um sorteio”.
- Melhorado o texto do estado vazio dos sorteios salvos.


## v1.10.3-ajustes-visuais

- Removido o botão redundante “Sortear novamente” dos modos comuns.
- “Reiniciar bingo” continua disponível apenas no Bingo.
- Ocultada a barra horizontal nativa do carrossel de modos.
- Cartelas de até 100 números agora usam uma grade 10 x 10 sem rolagem interna.
- Cartelas acima de 100 números continuam usando rolagem para preservar a legibilidade.


## v1.10.4-carrossel-cartela

- Correção reforçada para ocultar a barra horizontal nativa do carrossel de modos.
- Atualizada a versão do CSS e dos scripts para impedir cache antigo.
- Adicionada a opção “Visualizar cartela expandida”.
- Na visualização expandida, a cartela cresce na página e não usa rolagem interna.


## v1.10.5-bingo-listas

- No Bingo, a contagem regressiva ocorre apenas antes do primeiro número de cada partida.
- Os próximos números usam somente a animação curta do Bingo.
- “Adicionar vários” aceita nomes por linha, vírgula ou ponto e vírgula.
- A tela informa quantos nomes serão adicionados e quantos duplicados serão ignorados.
- Aplicável a Sorteio por nomes, Roleta e Grupos / Times.


## v1.10.6-paginas-publicas

- Rodapé institucional com links separados e discretos.
- Página Sobre atualizada com os cinco modos disponíveis.
- Removidas referências a planos, fases de testes e recursos futuros das páginas públicas.
- Política de Privacidade simplificada, mantendo informações essenciais ao usuário.
- Termos de Uso simplificados e atualizados.


## v1.10.7-corrigir-rodape-cards

- Corrigido o rodapé das páginas abertas por “Saiba mais”.
- Os links institucionais dessas páginas agora ficam separados e discretos.
- Alinhados os links “Saiba mais” na base dos cartões de modos.


## v1.10.8-sorteios-salvos

- Adicionado “Duplicar” para criar um novo sorteio com a mesma lista e configurações.
- A cópia começa sem resultado; no Bingo, o histórico de números também é reiniciado.
- Adicionado “Renomear” aos sorteios salvos.
- Adicionado “Usar lista” para criar e abrir uma cópia em outro modo entre Nomes, Roleta e Grupos/Times.
- A confirmação de exclusão foi mantida e ficou mais explícita.


## v1.10.9-consistencia

Correção de consistência de controles já existentes:

- Todos os avisos nativos do navegador foram removidos.
- Excluir, renomear, limpar participantes, limpar histórico e reiniciar Bingo agora usam diálogos próprios do Sortick.
- Duplicar e usar lista em outro sorteio foram mantidos como recursos existentes.
- A cópia de sorteio consulta a versão mais recente salva antes de duplicar, preservando participantes e configurações.
- Cópias começam sem resultado; cópias de Bingo começam sem histórico.


## v1.10.10-corrigir-excluir

- Corrigido o botão “Excluir sorteio” no modal de confirmação.
- O botão agora tem fundo vermelho sólido e texto branco no modal claro.
- Nenhuma lógica dos sorteios salvos foi alterada.


## v1.11-cartela-compartilhamento

Atualização maior de recursos de produto, mantida apenas no ambiente de testes:

- Cartela com título, prêmio, valor por número, data e observação opcionais.
- Barra de preenchimento e resumo de disponíveis, ocupados e confirmados.
- Marcadores opcionais: padrão por cores/pontos ou marcadores 🍀 e ✅.
- Visualização ampla da cartela em painel horizontal.
- Exportação de imagem completa da cartela, com opção “Mostrar nomes”.
- Compartilhamento de resultados reforçado com atalho para WhatsApp e Tela cheia.
- Ações de produção, ads.txt e configuração do Google Ads permanecem fora desta cópia de testes.


## v1.11.1-criacao-cartela

Ajuste da experiência de cartela após testes:

- A cartela agora é configurada antes da criação, em três etapas: Cartela, Prêmio e Opcionais.
- Prêmio e imagem podem ser adicionados antes de abrir a cartela.
- Depois de criada, a cartela usa “Editar detalhes” em vez de um painel lateral longo.
- Título, prêmio, imagem, valor, data e observação podem ser alterados depois.
- A quantidade de números é definida na criação e não pode ser alterada depois.
- Marcadores personalizados foram removidos; permanece o padrão visual de disponível, ocupado e confirmado.
- Imagem do prêmio aparece na cartela, na visualização e na exportação.


## v1.12-nucleo-simples

Atualização para fechar o núcleo simples do Sortick sem multiplicar modos parecidos.

### Sorteio por nomes e Roleta
- Formatos: um sorteado, vários sorteados ou ordem completa.
- Opção para não repetir sorteados durante a rodada.
- Reinício de rodada sem apagar a lista original.
- Roleta usa os mesmos formatos como versão visual do sorteio.

### Grupos / Times
- Nomes personalizados de grupos.
- Distribuição equilibrada, com diferença máxima de uma pessoa.
- Gerar novamente, copiar resumo e baixar imagem dos grupos.

### Decisões rápidas
- Novo tipo compacto, sem cartão extra na home:
  - Cara ou coroa.
  - Dado de 6, 8, 10, 12 ou 20 lados.
  - Número aleatório com mínimo e máximo.
- Sem lista de participantes, conta ou servidor.

### Limpeza
- Removidos os botões WhatsApp e Tela cheia.
- Permanecem copiar resumo, compartilhar e baixar imagem.
- Cartela, Bingo e sorteios salvos mantêm as funções já validadas.


## v1.13-finalizacao

- Corrigida a estrutura da seção de modos e reforçada a ocultação da barra horizontal do carrossel.
- Adicionado D4 nas decisões rápidas.
- Cara ou coroa, dado e número aleatório agora usam visuais 2D próprios, sem emoji como resultado principal.
- Criadas páginas: Como funciona, Ideias de uso e Perguntas frequentes.
- Reescritas as páginas dos modos com passos, exemplos e limites específicos.
- Esta continua sendo uma cópia de testes: sem Analytics, sem AdSense, sem PWA ativo e sem indexação.


## v1.13.1 — correção e organização

- Reforçada a ocultação da barra horizontal do carrossel.
- Corrigido o layout do rodapé em páginas institucionais e páginas dos modos.
- Atualizada a versão de CSS/JS para evitar cache antigo.
- Documentado o formulário de cartela em três etapas e a barra de preenchimento como recursos já existentes.
- Organizado o próximo passo da cartela: descrição, vários prêmios e regras de repetição.


## v1.14 — pacote completo

- Carrossel de modos sem barra horizontal visível.
- Rodapés institucionais revisados.
- Cara ou coroa com `?` antes do giro e resultado visual `🙂` ou `👑`.
- Dados 2D redesenhados: D4, D6, D8, D10, D12 e D20, com silhuetas distintas.
- Número aleatório com repetição opcional, sequência sem repetição e reinício de sequência.
- Bingo com progresso de números únicos.
- Cartela com descrição, vários prêmios, prêmios únicos ou repetíveis e histórico de sorteios de prêmios.
- Mantida a criação de cartela em três etapas, imagem de destaque, valor, data, observação, edição e exportação.
