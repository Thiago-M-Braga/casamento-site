# Imagens do site

Basta **substituir os arquivos mantendo exatamente os mesmos nomes**. Nenhum
componente precisa ser alterado — os caminhos estão em `config/wedding.ts` e
`config/gifts.ts`.

Enquanto um arquivo não existir, o site mostra um placeholder elegante no lugar
(sem imagem quebrada). Você pode publicar antes de ter todas as fotos.

## Nomes esperados

### `banner/` — fundo do hero (rotativo)
```
imagem-banner-1.webp
imagem-banner-2.webp
```

### `casal/` — retratos na página inicial e em "Nossa história"
```
imagem-casal-1.webp
imagem-casal-2.webp
```

### `historia/` — um por evento da linha do tempo
```
imagem-historia-1.webp
imagem-historia-2.webp
imagem-historia-3.webp
imagem-historia-4.webp
imagem-historia-5.webp
```

### `presentes/` — um por presente da lista
```
imagem-presente-chocolate.webp
imagem-presente-rpg.webp
imagem-presente-lua-de-mel.webp
imagem-presente-cafe.webp
imagem-presente-gato.webp
imagem-presente-danca.webp
imagem-presente-panela.webp
imagem-presente-pizza.webp
imagem-presente-reforma.webp
imagem-presente-plantas.webp
imagem-presente-streaming.webp
```

### `galeria/` — galeria de fotos
```
imagem-galeria-01.webp
imagem-galeria-02.webp
...
imagem-galeria-12.webp
```

### `decoracao/` — fotos dos locais (cerimônia e recepção)
```
imagem-decoracao-1.webp
imagem-decoracao-2.webp
```

## Recomendações técnicas

| Uso              | Proporção | Largura sugerida |
| ---------------- | --------- | ---------------- |
| Banner / hero    | 16:9      | 2000 px          |
| Casal / história | 4:3       | 1200 px          |
| Presentes        | 4:3       | 800 px           |
| Galeria          | 1:1       | 1200 px          |

- Prefira **WebP** (ou AVIF). O `next/image` já serve AVIF/WebP automaticamente.
- Mantenha cada arquivo abaixo de ~400 KB para não prejudicar o Lighthouse.
- Para adicionar mais fotos na galeria, inclua o arquivo aqui **e** a entrada
  correspondente em `galleryImages`, dentro de `config/wedding.ts`.
- Sempre escreva um `alt` descritivo na configuração — isso é acessibilidade,
  não enfeite.
