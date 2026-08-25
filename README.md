# Site de casamento

Site de casamento completo e personalizável: contagem regressiva, história do
casal, informações da cerimônia e recepção, lista de presentes com PIX e links
de pagamento, confirmação de presença (RSVP), mural de mensagens e galeria de
fotos.

**Stack:** Next.js (App Router) · TypeScript · React · Tailwind CSS · Supabase
(PostgreSQL) · Mercado Pago · Vercel.

---

## Sumário

1. [Começando](#1-começando)
2. [Comandos](#2-comandos)
3. [O que editar (e onde)](#3-o-que-editar-e-onde)
4. [Imagens](#4-imagens)
5. [Cores, fontes e identidade visual](#5-cores-fontes-e-identidade-visual)
6. [Lista de presentes](#6-lista-de-presentes)
7. [Formas de pagamento](#7-formas-de-pagamento)
8. [Supabase (banco de dados)](#8-supabase-banco-de-dados)
9. [Mercado Pago](#9-mercado-pago)
10. [Painel administrativo](#10-painel-administrativo)
11. [Deploy na Vercel](#11-deploy-na-vercel)
12. [Domínio próprio](#12-domínio-próprio)
13. [Estrutura de pastas](#13-estrutura-de-pastas)
14. [Segurança](#14-segurança)
15. [Checklist antes de divulgar](#15-checklist-antes-de-divulgar)

---

## 1. Começando

Requisitos: **Node.js 20.9+** e npm.

```bash
npm install
cp .env.example .env.local   # no Windows/PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Abra <http://localhost:3000>.

O site **roda sem nenhuma configuração**: sem Supabase, os formulários validam,
respondem normalmente e apenas registram no console do servidor (modo
desenvolvimento). As imagens que ainda não existem aparecem como placeholders
elegantes. Assim você pode ver o resultado antes de configurar qualquer serviço.

> `.env.local` nunca deve ser commitado — já está no `.gitignore`.

---

## 2. Comandos

| Comando             | O que faz                                      |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento (hot reload)       |
| `npm run build`     | Build de produção                              |
| `npm start`         | Roda o build de produção localmente            |
| `npm run typecheck` | Verifica os tipos sem gerar arquivos           |

### "Salvei o arquivo e a tela não mudou"

Só o `npm run dev` recarrega sozinho. Se a tela estiver congelada, verifique
nesta ordem:

1. **O `npm run dev` está rodando?** O terminal precisa mostrar
   `Local: http://localhost:3000`. Sem ele, o navegador só mostra uma página
   velha em cache.

2. **Ele subiu na porta 3000 mesmo?** Se aparecer
   `Port 3000 is in use ... using available port 3001 instead`, existe outro
   servidor preso na 3000 — provavelmente um `npm start` antigo, que serve um
   build congelado e **não** recarrega. Você estaria olhando o servidor errado.

   Para achar e encerrar o processo preso (PowerShell):

   ```powershell
   Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
     Where-Object { $_.CommandLine -like "*casamento-site*" } |
     Select-Object ProcessId, CommandLine

   Stop-Process -Id <PID> -Force
   ```

3. **É uma imagem nova?** Arquivos em `public/` são servidos na hora, mas o
   caminho em `config/` precisa bater **exatamente** com o nome do arquivo,
   incluindo maiúsculas e extensão.

4. **Mexeu em `tailwind.config.ts` ou `config/theme.ts`?** Aí vale reiniciar o
   `npm run dev`, porque o Tailwind lê essas configurações na inicialização.

---

## 3. O que editar (e onde)

**Regra do projeto:** nada de nome, data, endereço, link ou valor escrito dentro
de componente. Tudo mora em `config/`.

| Quero mudar…                                     | Arquivo                 |
| ------------------------------------------------ | ----------------------- |
| Nomes, data, horário, locais, contato, redes     | `config/wedding.ts`     |
| Textos da história e da linha do tempo           | `config/wedding.ts`     |
| Fotos da galeria e informações úteis             | `config/wedding.ts`     |
| Chave PIX, link do Mercado Pago, formas de pagamento | `config/wedding.ts` → `payments` |
| Velocidade da rolagem suave                      | `config/theme.ts` → `scroll.duration` |
| Endereço do painel (`/adm/2329`)                 | `config/wedding.ts` → `admin.secretPath` |
| Ligar/desligar seções (presentes, RSVP, galeria) | `config/wedding.ts` → `features` |
| Lista de presentes e valores                     | `config/gifts.ts`       |
| Cores, fontes, sombras, espaçamentos             | `config/theme.ts`       |
| Itens do menu                                    | `config/navigation.ts`  |

### Exemplo: trocar a data

```ts
// config/wedding.ts
wedding: {
  date: "2027-08-21",   // AAAA-MM-DD
  time: "16:00",        // 24h
  timezone: "America/Sao_Paulo",
},
```

A contagem regressiva, o título das páginas, o sitemap e os dados estruturados
do Google se atualizam sozinhos.

### Exemplo: desligar uma seção

```ts
features: {
  gifts: true,
  rsvp: true,
  gallery: false,   // remove a galeria do menu e do site
  guestMessages: true,
  usefulInfo: true,
  music: false,
  easterEggs: true,
},
```

---

## 4. Imagens

Coloque os arquivos em `public/images/`, **mantendo os nomes esperados**. Veja a
lista completa em [`public/images/README.md`](public/images/README.md).

```
public/images/
├── banner/      imagem-banner-1.webp, imagem-banner-2.webp
├── casal/       imagem-casal-1.webp, imagem-casal-2.webp
├── historia/    imagem-historia-1.webp … -5.webp
├── presentes/   imagem-presente-chocolate.webp, imagem-presente-rpg.webp …
├── galeria/     imagem-galeria-01.webp … -12.webp
└── decoracao/   imagem-decoracao-1.webp, imagem-decoracao-2.webp
```

Todas as imagens passam pelo `next/image` (WebP/AVIF automático, lazy loading e
dimensionamento por breakpoint). Enquanto um arquivo não existir, o componente
`SmartImage` mostra um placeholder no lugar — nada de ícone de imagem quebrada.

Para adicionar mais fotos na galeria, inclua o arquivo **e** a entrada
correspondente em `galleryImages`, em `config/wedding.ts`, sempre com um `alt`
descritivo.

---

## 5. Cores, fontes e identidade visual

Tudo em `config/theme.ts`. O `tailwind.config.ts` lê esse arquivo — ou seja,
mudar uma cor lá muda o site inteiro.

A paleta é **verde escuro + bordô + bege**:

```ts
// config/theme.ts
colors: {
  green: { 700: "#25332A", ... },  // primária — navbar, botões, faixas, títulos
  bordo: { 500: "#8E3B41", ... },  // acento — rótulos, ornamentos, destaques
  beige: { 100: "#F7F1E5", ... },  // fundo — quente, nunca branco puro
  ink:   { DEFAULT: "#2A2622" },   // texto
}
```

Cada cor tem a escala completa (`50` a `900` no verde e no bordô, `50` a `400`
no bege), então dá para trocar a família inteira mexendo só nos hex. Os nomes
das classes acompanham: `bg-green-700`, `text-bordo-500`, `bg-beige-100`.

Os fundos de seção saem de `components/ui/Section.tsx`, via a prop `tone`:
`beige` (padrão), `light`, `green` (faixa escura) e `bordo` (faixa suave).

As fontes são carregadas com `next/font` em `app/layout.tsx`
(Cormorant Garamond para títulos, Jost para texto, Great Vibes para os detalhes
manuscritos). Para trocar, altere os imports lá e os nomes das variáveis
`--font-*` em `app/globals.css`.

---

## 6. Lista de presentes

Edite `config/gifts.ts`:

```ts
{
  id: "chocolate-da-noiva",          // único, sem espaços
  title: "Chocolate da Noiva",
  emoji: "🍫",
  description: "Para manter a noiva feliz e o casamento funcionando.",
  value: 100,                         // em reais
  image: "/images/presentes/imagem-presente-chocolate.webp",
  paymentUrl: "",                     // link de pagamento (opcional)
  active: true,                       // false esconde do site
  featured: true,                     // destaca na home
}
```

O botão **Presentear** abre um modal onde o convidado escolhe a forma de
pagamento. Veja a seção seguinte.

A página `/presentes` mostra a lista inteira, com filtros por faixa de valor
(Todos · Até R$ 100 · R$ 100–500 · R$ 500+) e contagem de resultados. A home
mostra apenas os presentes marcados como `featured`, com um botão para a lista
completa.

---

## 7. Formas de pagamento

O convidado escolhe entre **cartão de crédito, boleto ou PIX** dentro do mesmo
modal (`components/gifts/PaymentModal.tsx`):

| Passo                    | O que acontece                                                       |
| ------------------------ | -------------------------------------------------------------------- |
| **Ir para o pagamento**  | Caminho principal. Manda para o Mercado Pago, e é **lá** que o convidado escolhe entre cartão (com parcelamento), boleto e PIX |
| **Prefiro pagar por PIX** | Alternativa. Mostra chave, QR Code e copia e cola, gerados aqui no site |
| **Já fiz o pagamento**   | Registra o presente no painel do casal (veja abaixo)                 |

### Cartão e boleto

```ts
// config/wedding.ts
payments: {
  // Link de pagamento do Mercado Pago, reutilizável por todos os convidados
  mercadoPagoLink: "https://mpago.la/...",
},
```

A ordem de resolução do link é: `paymentUrl` do presente → `mercadoPagoLink`
geral → checkout criado pela API (se `mercadoPagoEnabled` estiver ligado). Se
nada estiver configurado, a aba explica isso e o PIX continua funcionando.

Para gerar o link: Mercado Pago → **Sua empresa → Link de pagamento**. O mesmo
link serve para todos os convidados — **não** crie um link por pessoa.

### PIX

```ts
payments: {
  pixKey: "seu@email.com",       // e-mail, CPF, telefone ou chave aleatória
  pixName: "Nome do recebedor",
  pixCity: "FLORIANOPOLIS",      // exigido pelo padrão BR Code
},
```

O QR Code e o "copia e cola" são gerados pelo próprio site, no padrão EMV do
Banco Central (`lib/utils/pix.ts`) — sem serviço externo e sem custo. Nenhum
dado de pagamento passa pelo nosso servidor nem é armazenado.

Há também um bloco de **contribuição livre** na página de presentes, para quem
prefere escolher o valor em vez de pegar um card da lista.

### "Já fiz o pagamento"

Links de pagamento reutilizáveis e PIX não dizem **quem** pagou **o quê**. Por
isso o modal tem um passo final onde o convidado avisa:

- **nome** — ou a opção **Anônimo**, e aí nada é gravado no lugar do nome;
- **comprovante** — totalmente **opcional**. Dá para registrar o presente só
  clicando no botão. Aceita imagem ou PDF, até 5 MB;
- **recado** — opcional.

O aviso vai para a tabela `gift_payments` e aparece na lista *Presentes
comprados* do painel, onde o casal marca "conferido" depois de bater com o
extrato. O comprovante fica num bucket **privado** do Supabase Storage e é
aberto por URL assinada e temporária.

> Esses avisos são declarados pelo convidado, então trate-os como aviso, não
> como confirmação bancária. A confirmação automática só existe com a
> integração oficial do Mercado Pago ligada (seção 9).

---

## 8. Supabase (banco de dados)

Necessário para **persistir** o RSVP e as mensagens.

1. Crie um projeto em <https://supabase.com/dashboard>.
2. Em **Project Settings → API**, copie os valores para `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

3. Rode as migrations. Duas opções:

   **Dashboard (mais simples):** abra o **SQL Editor** e execute, em ordem, o
   conteúdo de:

   ```
   supabase/migrations/0001_init.sql
   supabase/migrations/0002_rls.sql
   supabase/migrations/0003_gift_payments.sql
   ```

   A `0003` cria a tabela `gift_payments` e o bucket **privado**
   `comprovantes` no Storage.

   **CLI:**

   ```bash
   npx supabase link --project-ref <ref-do-projeto>
   npx supabase db push
   ```

4. Reinicie `npm run dev` e envie um RSVP de teste. Confira em
   **Table Editor → guests**.

### Tabelas

| Tabela           | Para quê                                              |
| ---------------- | ----------------------------------------------------- |
| `guests`         | Confirmações de presença                              |
| `guest_messages` | Mural de recados (`approved = false` por padrão)      |
| `gift_payments`  | Presentes comprados, avisados pelos próprios convidados |
| `gifts`          | Opcional — a lista vive em `config/gifts.ts`          |
| `payments`       | Pagamentos, se o Mercado Pago for ativado             |

### Row Level Security

O RLS fica **ligado em todas as tabelas** (`0002_rls.sql`). O visitante público:

- ✅ pode ler mensagens **aprovadas** e presentes **ativos**;
- ❌ não pode listar convidados, ver pagamentos, editar RSVP de outra pessoa nem
  alterar presentes.

As escritas passam pelos Route Handlers (`app/api/…`) usando a service role key,
que só existe no servidor. Assim toda gravação passa por validação, sanitização
e rate limiting.

---

## 9. Mercado Pago

**Opcional.** A primeira versão funciona muito bem com links de pagamento + PIX.

Para ativar o Checkout Pro:

1. `config/wedding.ts` → `payments.mercadoPagoEnabled = true`
2. `.env.local`:

   ```env
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...
   ```

3. No painel do Mercado Pago, cadastre o webhook:

   ```
   https://seu-dominio.com.br/api/webhooks/mercadopago
   ```

Fluxo: o convidado clica em **Presentear** → `POST /api/payments` cria a
preferência → é redirecionado ao ambiente seguro do Mercado Pago → volta para
`/agradecimento`, `/pagamento/pendente` ou `/pagamento/erro` → o webhook grava o
pagamento em `payments`.

O access token **nunca** sai do servidor. O site não coleta número de cartão,
CVV nem validade em nenhum momento.

Se um dia quiser trocar de provedor, implemente a interface `PaymentProvider`
(`lib/mercadopago/provider.ts`) — nada no frontend precisa mudar.

---

## 10. Painel do casal

Endereço: **`/adm/2329`**

O código vem de `weddingConfig.admin.secretPath` e pode ser trocado sem mexer no
código-fonte, pela variável `ADMIN_SECRET_PATH`. Qualquer outro código responde
**404**, então o painel não se anuncia para quem não sabe o endereço.

O código da URL **não é a proteção**, é só a primeira barreira. A página também
pede senha, porque ali ficam nomes, telefones e comprovantes dos convidados:

```env
ADMIN_PASSWORD=uma-senha-longa-e-aleatoria
ADMIN_SECRET_PATH=2329          # opcional
```

Sem `ADMIN_PASSWORD` o painel fica **desabilitado** e não mostra dado nenhum.

### O que o painel mostra

- **Números**: respostas, confirmados, recusados, pessoas esperadas (adultos e
  crianças), presentes comprados, valor declarado, valor confirmado pelo
  Mercado Pago e mensagens pendentes.
- **Presentes comprados**: cada aviso enviado pelos convidados, com nome (ou
  "Anônimo"), valor, forma de pagamento, recado, link para o comprovante e um
  checkbox **Conferido** para marcar o que já bateu com o extrato.
- **Confirmações**: a lista completa do RSVP, com acompanhantes, contato e
  observações.
- **Mensagens**: o mural, com o status de moderação.

Para **aprovar uma mensagem**, mude `approved` para `true` na tabela
`guest_messages` (Table Editor do Supabase).

---

## 11. Deploy na Vercel

```
GitHub  →  Vercel  →  Next.js
```

1. Suba o projeto para um repositório no GitHub:

   ```bash
   git init
   git add .
   git commit -m "Site de casamento"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
   git push -u origin main
   ```

2. Em <https://vercel.com/new>, importe o repositório. A Vercel detecta o
   Next.js sozinha — não mexa nas configurações de build.

3. Em **Settings → Environment Variables**, cadastre as mesmas variáveis do
   `.env.local` (marque *Production* e *Preview*):

   ```
   NEXT_PUBLIC_SITE_URL
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ADMIN_PASSWORD
   MERCADOPAGO_ACCESS_TOKEN                (se usar)
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY      (se usar)
   ```

4. Deploy. Cada `git push` na `main` publica automaticamente.

---

## 12. Domínio próprio

1. Registre o domínio (Registro.br, Cloudflare, etc.).
2. Na Vercel: **Settings → Domains → Add** e informe `www.seudominio.com.br`.
3. Configure o DNS conforme as instruções que a Vercel mostra (normalmente um
   `CNAME` para `cname.vercel-dns.com` no `www` e um redirecionamento do
   domínio raiz).
4. Atualize `NEXT_PUBLIC_SITE_URL` e `weddingConfig.site.url` com o endereço
   final — isso corrige os links de compartilhamento, o Open Graph, o sitemap e
   as URLs de retorno do pagamento.

O certificado HTTPS é emitido automaticamente.

---

## 13. Estrutura de pastas

```
app/                    Rotas (App Router)
├── page.tsx            Home
├── historia/           Nossa história
├── casamento/          Cerimônia e recepção
├── presentes/          Lista de presentes
├── rsvp/               Confirmação de presença
├── galeria/            Galeria de fotos
├── agradecimento/      Retorno de pagamento aprovado
├── pagamento/          Retorno pendente / recusado
├── adm/[codigo]/       Painel do casal (/adm/2329)
├── api/                Route Handlers (rsvp, messages, payments, webhooks)
├── icon.tsx            Favicon gerado a partir das iniciais
├── opengraph-image.tsx Imagem de compartilhamento gerada no build
├── robots.ts           robots.txt
└── sitemap.ts          sitemap.xml

components/
├── layout/             Navbar, Footer, rolagem suave, transição de página
├── sections/           Hero, contagem, timeline, locais, info úteis
├── ui/                 Botões, campos, modal, imagem, animação
├── gifts/              Cards, grade, filtros, modal de pagamento
├── rsvp/               Formulário e tela de sucesso
├── messages/           Mural de recados
├── gallery/            Grid e lightbox
└── admin/              Login e dashboard

config/                 wedding.ts · gifts.ts · theme.ts · navigation.ts
lib/                    supabase/ · mercadopago/ · utils/ · validations/ · admin/
types/                  Tipos compartilhados
supabase/migrations/    SQL (tabelas + RLS)
public/images/          Fotos, organizadas por seção
```

---

## 14. Segurança

- Nenhuma credencial no frontend. Só variáveis `NEXT_PUBLIC_*` chegam ao
  navegador, e elas são públicas por definição.
- `SUPABASE_SERVICE_ROLE_KEY`, `MERCADOPAGO_ACCESS_TOKEN` e `ADMIN_PASSWORD`
  são lidos apenas em Route Handlers e Server Components.
- RLS ligado em todas as tabelas; o banco não fica aberto.
- Formulários protegidos por validação dupla (cliente + servidor, com Zod),
  sanitização, honeypot e rate limiting por IP.
- Nenhum dado de cartão é coletado ou armazenado.
- Aviso de privacidade nos formulários; coletamos só o necessário.

> O rate limiting é em memória (`lib/utils/rate-limit.ts`), suficiente para o
> tráfego de um casamento. Para algo maior, troque por Vercel KV ou Upstash
> mantendo a mesma assinatura de `checkRateLimit`.

---

## 15. Checklist antes de divulgar

- [ ] `config/wedding.ts` com nomes, data, horário e endereços reais
- [ ] Chave PIX conferida (faça um teste de R$ 1 com você mesmo)
- [ ] `payments.mercadoPagoLink` preenchido, para liberar cartão e boleto
- [ ] Links de pagamento dos presentes testados
- [ ] Imagens substituídas em `public/images/`
- [ ] Supabase configurado e um RSVP de teste aparecendo na tabela `guests`
- [ ] Migrations aplicadas: `0001`, `0002` (RLS) e `0003` (presentes comprados)
- [ ] Aviso de presente testado, com e sem comprovante, e visível em `/adm/2329`
- [ ] `NEXT_PUBLIC_SITE_URL` com o domínio final
- [ ] `npm run build` passando sem erros
- [ ] Testado em celular de verdade (o link vai circular no WhatsApp)
- [ ] Prévia do link conferida enviando para você mesmo no WhatsApp
- [ ] `ADMIN_PASSWORD` definida, se você quiser o painel
