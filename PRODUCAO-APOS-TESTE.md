# Publicação após validar a v1.12

Este pacote é exclusivo do ambiente de testes. Ele usa:

- caminhos iniciados em `/sortick-teste/`;
- armazenamento separado de testes;
- `noindex`;
- sem Analytics, AdSense e redirecionamento do domínio oficial.

## Não subir este ZIP diretamente no repositório oficial

Depois de validar a v1.12 em computador e celular, preparar uma cópia específica de produção:

1. Remover o prefixo `/sortick-teste/` dos links e arquivos.
2. Restaurar Analytics, AdSense, PWA e o domínio oficial conforme a versão de produção.
3. Manter a mesma chave de armazenamento de produção, sem alterar dados salvos dos usuários.
4. Adicionar ou confirmar `ads.txt` no domínio oficial.
5. Conferir Google Ads:
   - `create_draw` como conversão principal;
   - `start_draw` como conversão complementar;
   - page view fora da meta principal.
6. Publicar uma única atualização no repositório oficial e testar `sortick.com.br`.

A versão pode ser publicada no site padrão depois desse processo e de uma revisão final de compatibilidade.


## Incluir na futura cópia de produção

Aplicar também:

- regras finais de carrossel sem barra horizontal;
- regras finais de rodapé para páginas de modos e institucionais;
- atualização de cache CSS/JS;
- documentação organizada de cartela e preenchimento.

A captura com URL `sortick.com.br/...` representa a versão oficial, não o ambiente de testes. Essas correções entram quando for criado o pacote de produção.


## v1.14

Esta é uma cópia exclusiva para o repositório de testes. Após a aprovação final, gerar um pacote de produção separado com:

- caminhos sem `/sortick-teste/`;
- remoção de `noindex`;
- robots e sitemap de produção;
- chave de armazenamento de produção preservando os sorteios existentes;
- Analytics/PWA configurados para o domínio oficial;
- revisão final de canônicos e `ads.txt`.
