# Sortick Teste v1.10.8-sorteios-salvos

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
