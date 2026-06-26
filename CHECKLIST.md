# Checklist de teste do Sortick

## Página inicial
- [ ] Logo aparece no topo.
- [ ] Botão "Criar sorteio" funciona.
- [ ] Links do menu funcionam.
- [ ] Rodapé mostra Sobre, Privacidade, Termos e Reportar erro.

## Sorteio por nomes
- [ ] Criar sorteio por nomes.
- [ ] Adicionar participante manualmente.
- [ ] Adicionar vários nomes.
- [ ] Embaralhar lista.
- [ ] Alternar Confirmado/Pendente.
- [ ] Sortear normalmente.
- [ ] Sortear apenas confirmados.
- [ ] Remover vencedor após sortear.
- [ ] Baixar imagem.
- [ ] Compartilhar.
- [ ] Copiar resumo.

## Roleta
- [ ] Criar roleta.
- [ ] Adicionar 2 participantes.
- [ ] Adicionar 10+ participantes.
- [ ] Conferir se a roleta para no mesmo vencedor mostrado no resultado.
- [ ] Testar Sortear apenas confirmados.
- [ ] Testar Remover vencedor após sortear.
- [ ] Verificar se a roleta não muda o resultado após remover vencedor.

## Cartela de números
- [ ] Criar cartela com 50 números.
- [ ] Clicar em número disponível.
- [ ] Associar nome ao número.
- [ ] Conferir se número ocupado fica vermelho.
- [ ] Clicar em número ocupado para alternar Confirmado/Pendente.
- [ ] Testar Sortear apenas confirmados.
- [ ] Testar Remover vencedor após sortear.
- [ ] Conferir se número removido volta a ficar disponível.

## Páginas extras
- [ ] sobre.html abre.
- [ ] privacidade.html abre.
- [ ] termos.html abre.
- [ ] offline.html abre.
- [ ] Links do rodapé funcionam.
- [ ] Reportar erro abre e-mail.

## Mobile
- [ ] Página inicial não quebra.
- [ ] Botões não ficam cortados.
- [ ] Roleta fica circular.
- [ ] Cartela é clicável.
- [ ] Compartilhar abre menu nativo ou copia texto.

## PWA / GitHub Pages
- [ ] Favicon aparece.
- [ ] Manifest é reconhecido.
- [ ] Service worker registra.
- [ ] Site abre pelo link do GitHub Pages.
- [ ] App pode ser instalado/adicionado à tela inicial quando disponível.


## Testes v1.10.2 — interface

- [ ] Rodapé mostra “Erro/sugestões?”.
- [ ] Link abre e-mail com opção de erro ou sugestão.
- [ ] Tela de sorteio mostra “Sortear novamente”.
- [ ] A explicação informa que a lista será mantida.
- [ ] “Criar um sorteio” aparece na página inicial.
- [ ] Estado vazio dos sorteios salvos está claro.


## Testes v1.10.3 — ajustes visuais

- [ ] Nos modos Nomes, Roleta, Cartela e Grupos, só existe o botão principal de sortear.
- [ ] No Bingo, “Reiniciar bingo” aparece e limpa o histórico após confirmação.
- [ ] O carrossel não mostra barra horizontal, mas as setas funcionam.
- [ ] Uma cartela de 1 a 100 aparece inteira, sem barra vertical interna.
- [ ] Uma cartela com mais de 100 números continua legível e pode usar rolagem.


## Testes v1.10.4 — carrossel e cartela

- [ ] O carrossel de modos não mostra barra horizontal.
- [ ] As setas do carrossel continuam funcionando.
- [ ] A cartela mostra “Visualizar cartela expandida”.
- [ ] Ao expandir, a barra vertical interna desaparece.
- [ ] Ao fechar, a cartela volta ao tamanho normal.
- [ ] Números ocupados, confirmados e disponíveis continuam funcionando.


## Testes v1.10.5 — Bingo e listas

- [ ] O primeiro número de um Bingo mostra 3, 2, 1.
- [ ] O segundo número e os seguintes não repetem a contagem regressiva.
- [ ] Após “Reiniciar bingo”, a contagem volta antes do primeiro número.
- [ ] “Adicionar vários” aceita uma pessoa por linha.
- [ ] “Adicionar vários” aceita nomes separados por vírgula ou ponto e vírgula.
- [ ] Duplicados na lista ou já existentes são avisados e ignorados.
- [ ] Nomes, Roleta e Grupos continuam adicionando participantes normalmente.


## Testes v1.10.6 — páginas públicas

- [ ] Rodapé mostra links separados por pontos, sem palavras coladas.
- [ ] Sobre mostra os cinco modos atuais.
- [ ] Sobre não menciona recursos futuros.
- [ ] Privacidade está clara sem explicar detalhes técnicos de implementação.
- [ ] Termos não mencionam fases de testes ou planos futuros.
- [ ] Links do rodapé funcionam nas três páginas.


## Testes v1.10.7 — rodapé dos modos e cartões

- [ ] Em cada página aberta por “Saiba mais”, o rodapé mostra Sortick e links separados.
- [ ] Sobre, Privacidade, Termos e Erro/sugestões? aparecem com espaçamento normal.
- [ ] Os links “Saiba mais” de todos os cartões ficam alinhados na mesma altura.
- [ ] Links dos rodapés continuam funcionando.
