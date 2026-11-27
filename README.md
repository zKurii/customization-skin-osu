# Skinlab

Editor visual de skins para osu!mania, com pré-visualização ilustrativa que acompanha as mudanças de estilo, cores, número de teclas e animação em tempo real.

## Acessar pelo link

[Abrir o Skinlab no GitHub Pages](https://zkurii.github.io/customization-skin-osu/).

O site é publicado automaticamente pelo GitHub Pages quando há uma alteração na branch `main`.
Na primeira vez, [ative o GitHub Pages nas configurações do repositório](https://github.com/zKurii/customization-skin-osu/settings/pages) selecionando **GitHub Actions** como origem. Em seguida, abra o [workflow de publicação](https://github.com/zKurii/customization-skin-osu/actions/workflows/deploy-pages.yml) e clique em **Run workflow** para publicar a versão inicial. O link acima estará disponível quando a execução terminar; alterações futuras na branch `main` serão publicadas automaticamente.

## Usar

Abra `index.html` em um navegador moderno. Não é necessário instalar dependências nem iniciar um servidor.

- Escolha o estilo e a cor das notas.
- Alterne entre 4K e 7K, ajuste os acentos e ative ou pause a animação.
- Escolha um estilo e uma cor para o painel de ranking.
- Importe artes em PNG, JPG ou WebP, de até 5 MB, para as notas, o painel de ranking ou o fundo. As imagens ficam no seu navegador e são incluídas na exportação.
- Use **Exportar skin** para baixar a configuração e as artes selecionadas em um arquivo JSON.
- Use **Restaurar** para voltar às opções originais.

> A tela de jogo é uma prévia ilustrativa da personalização, não uma captura nem um simulador do jogo. O arquivo JSON exportado guarda as configurações e os assets; não é, por si só, um pacote de skin instalável no osu!.
