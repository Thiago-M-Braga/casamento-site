# SPEC — SITE DE CASAMENTO PERSONALIZADO

## 1. Objetivo

Criar um site de casamento moderno, elegante, responsivo e altamente personalizável, inspirado na estrutura e experiência do site de referência:

https://noivos.casar.com/thiago-e-larissa-2027

O site será desenvolvido do zero, sem copiar código, assets ou conteúdo proprietário do site de referência.

O objetivo é ter uma experiência semelhante à de uma plataforma profissional de casamento, porém totalmente controlada pelo casal.

O site deverá contemplar:

* Página inicial
* Contagem regressiva
* História do casal
* Informações da cerimônia/recepção
* Localização com mapa
* Lista de presentes engraçada
* Pagamento dos presentes
* Confirmação de presença (RSVP)
* Mensagens dos convidados
* Galeria de fotos
* Links úteis
* Design totalmente responsivo
* Configuração centralizada através de arquivo de variáveis
* Estrutura preparada para deploy público
* Estrutura preparada para banco de dados
* Estrutura preparada para integração com Mercado Pago

---

# 2. Stack obrigatória

Utilizar:

* Next.js
* TypeScript
* React
* Tailwind CSS
* Supabase/PostgreSQL
* Vercel para hospedagem
* Mercado Pago para pagamentos
* Git/GitHub

Preferir App Router do Next.js.

Não utilizar backend separado se não for necessário.

Utilizar:

* Server Components quando fizer sentido
* Client Components somente quando houver interatividade
* Route Handlers/API Routes para operações server-side
* Environment Variables para credenciais e configurações sensíveis

---

# 3. Arquitetura geral

Estrutura esperada:

```text
/
├── app/
│   ├── page.tsx
│   ├── historia/
│   ├── casamento/
│   ├── presentes/
│   ├── rsvp/
│   ├── galeria/
│   ├── agradecimento/
│   └── api/
│       ├── rsvp/
│       ├── payments/
│       └── webhooks/
│
├── components/
│   ├── layout/
│   ├── sections/
│   ├── ui/
│   ├── gifts/
│   ├── rsvp/
│   └── gallery/
│
├── config/
│   └── wedding.ts
│
├── lib/
│   ├── supabase/
│   ├── mercadopago/
│   ├── utils/
│   └── validations/
│
├── public/
│   ├── images/
│   │   ├── banner/
│   │   ├── casal/
│   │   ├── historia/
│   │   ├── presentes/
│   │   ├── galeria/
│   │   └── decoracao/
│   │
│   ├── icons/
│   └── fonts/
│
├── types/
│   └── index.ts
│
├── supabase/
│   └── migrations/
│
├── .env.example
├── README.md
├── package.json
└── ...
```

---

# 4. Arquivo de configuração global

Criar obrigatoriamente:

```text
/config/wedding.ts
```

Esse arquivo deverá concentrar todas as informações que o casal provavelmente irá alterar no futuro.

Exemplo:

```ts
export const weddingConfig = {
  couple: {
    bride: "NOME DA NOIVA",
    groom: "NOME DO NOIVO",
    displayName: "NOIVA & NOIVO",
  },

  wedding: {
    date: "2027-XX-XX",
    time: "XX:XX",
    timezone: "America/Sao_Paulo",
  },

  ceremony: {
    name: "Nome do local",
    address: "Endereço completo",
    city: "Cidade",
    state: "SC",
    mapsUrl: "",
  },

  reception: {
    name: "Nome do local",
    address: "Endereço completo",
    city: "Cidade",
    state: "SC",
    mapsUrl: "",
  },

  contact: {
    whatsapp: "",
    email: "",
  },

  social: {
    instagram: "",
  },

  payments: {
    pixKey: "",
    pixName: "",
    mercadoPagoEnabled: true,
  },

  site: {
    title: "Nome dos Noivos",
    description: "Nosso casamento",
    url: "",
  },

  features: {
    gifts: true,
    rsvp: true,
    gallery: true,
    guestMessages: true,
  },
};
```

IMPORTANTE:

Nenhuma credencial secreta deve ficar nesse arquivo.

Tokens, Access Tokens, Service Role Keys e outras credenciais devem utilizar `.env`.

---

# 5. Variáveis de ambiente

Criar:

```text
.env.example
```

Com algo semelhante a:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

NEXT_PUBLIC_SITE_URL=
```

Nunca commitar `.env.local`.

Adicionar ao `.gitignore`.

---

# 6. Pasta de imagens

Criar uma estrutura organizada:

```text
/public/images/
```

Dentro dela:

```text
/public/images/banner/
/public/images/casal/
/public/images/historia/
/public/images/presentes/
/public/images/galeria/
/public/images/decoracao/
```

As imagens deverão possuir nomes previsíveis e fáceis de substituir.

Exemplo:

```text
imagem-banner-1.webp
imagem-banner-2.webp

imagem-casal-1.webp
imagem-casal-2.webp

imagem-historia-1.webp
imagem-historia-2.webp

imagem-presente-rpg.webp
imagem-presente-chocolate.webp
imagem-presente-lua-de-mel.webp
```

O código nunca deverá depender de nomes gerados automaticamente.

As imagens deverão ser facilmente substituíveis pelo casal sem necessidade de alterar componentes.

Utilizar `next/image`.

---

# 7. Design

O design deverá ser:

* elegante
* romântico
* moderno
* minimalista
* sofisticado
* com bastante espaço em branco
* tipografia elegante
* animações discretas
* mobile-first

Evitar aparência de template genérico.

A inspiração visual deve vir do site de referência, mas a implementação deve possuir identidade própria.

Criar uma identidade visual centralizada em:

```text
/config/theme.ts
```

ou equivalente.

Centralizar:

* cores
* fontes
* border radius
* sombras
* espaçamentos
* tamanhos principais

Isso permitirá alterar completamente a identidade visual posteriormente.

---

# 8. Home

Criar uma Hero Section de grande impacto.

Deve conter:

* foto principal
* nomes do casal
* data
* frase curta
* contagem regressiva

Exemplo:

```text
NOME & NOME

"Uma nova aventura começa aqui."

XX de XXXXXXX de 2027

[ 245 ] dias
[ 08 ] horas
[ 32 ] minutos
[ 10 ] segundos
```

A contagem regressiva deve utilizar a data definida em:

```text
config/wedding.ts
```

Não hardcodar a data dentro do componente.

Quando a data chegar:

* parar a contagem
* mostrar uma mensagem especial

---

# 9. Navegação

Criar navbar responsiva.

Desktop:

```text
INÍCIO
NOSSA HISTÓRIA
O CASAMENTO
PRESENTES
RSVP
GALERIA
```

Mobile:

menu hamburger.

A navbar deverá ser sticky/fixed de maneira elegante.

O scroll para as seções deve possuir comportamento suave.

---

# 10. Nossa história

Criar seção contando a história do casal.

Estrutura sugerida:

* título
* texto
* fotos
* timeline

Exemplo:

```text
Nossa história

2019
O primeiro encontro

2020
A primeira viagem

2023
O pedido

2027
O grande dia
```

Todos os textos e imagens devem ser facilmente editáveis.

Idealmente armazenar os eventos da timeline em configuração:

```ts
timeline: [
  {
    year: "2019",
    title: "...",
    description: "...",
    image: "/images/historia/imagem-historia-1.webp"
  }
]
```

---

# 11. O casamento

Criar seção com:

## Cerimônia

* nome do local
* endereço
* horário
* descrição
* botão "Como chegar"

## Recepção

* nome
* endereço
* horário
* descrição
* botão "Como chegar"

Integrar Google Maps através de link externo.

Não utilizar API do Google Maps se um simples link/iframe for suficiente.

---

# 12. Lista de presentes

Essa é uma das principais funcionalidades.

Criar uma página/seção visualmente divertida.

Os presentes serão fictícios.

Exemplo:

```text
LISTA DE PRESENTES

"Vocês não precisam nos dar nada...
mas se quiserem financiar nossas decisões questionáveis,
fiquem à vontade."

[ Presente ]

🍫 Chocolate da Noiva

R$ 100

"Uma contribuição para manter a noiva
alimentada e, consequentemente,
o casamento funcionando."

[ PRESENTEAR ]
```

Outro exemplo:

```text
🎲 RPG DO NOIVO

R$ 1.000

"Ajude o noivo a assistir RPG na televisão
sem ouvir reclamações por pelo menos
alguns meses."

[ PRESENTEAR ]
```

---

# 13. Modelo dos presentes

Criar um tipo:

```ts
type Gift = {
  id: string;
  title: string;
  description: string;
  value: number;
  image?: string;
  paymentUrl?: string;
  active: boolean;
  featured?: boolean;
};
```

Inicialmente os presentes podem ficar em:

```text
/config/gifts.ts
```

Isso permitirá alterar facilmente a lista sem banco de dados.

Exemplo:

```ts
export const gifts: Gift[] = [
  {
    id: "chocolate-noiva",
    title: "Chocolate da Noiva",
    description:
      "Para manter a noiva feliz e o casamento funcionando.",
    value: 100,
    image: "/images/presentes/imagem-presente-chocolate.webp",
    paymentUrl: "",
    active: true,
  },
];
```

---

# 14. Pagamentos — primeira versão

A primeira versão deve suportar links de pagamento externos.

Cada presente poderá possuir:

```ts
paymentUrl
```

Exemplo:

```ts
paymentUrl:
  "https://www.mercadopago.com.br/..."
```

Ao clicar em:

```text
PRESENTEAR
```

abrir o link de pagamento correspondente.

IMPORTANTE:

O mesmo link poderá ser utilizado por diversos convidados.

Não criar links individuais por convidado.

Um presente pode ter um link de pagamento reutilizável.

---

# 15. Pagamentos — arquitetura preparada para evolução

Embora a primeira versão possa utilizar links externos, estruturar o código para posteriormente suportar integração oficial do Mercado Pago.

Criar uma abstração:

```text
PaymentProvider
```

Com métodos conceituais:

```ts
createPayment()
getPayment()
handleWebhook()
```

Assim será possível posteriormente trocar:

```text
link externo
```

por:

```text
Mercado Pago Checkout Pro/API
```

sem reconstruir toda a aplicação.

O Mercado Pago possui Checkout Pro com redirecionamento para ambiente seguro e também Checkout Transparente para uma experiência integrada ao próprio site.

---

# 16. NÃO implementar cartão diretamente no frontend na primeira versão

Não armazenar:

* número de cartão
* CVV
* validade
* senha
* dados sensíveis de pagamento

no banco ou frontend.

Caso seja implementado Checkout Transparente no futuro, utilizar o SDK/API oficial do Mercado Pago e manter credenciais privadas exclusivamente no backend/server-side.

---

# 17. PIX

Adicionar uma opção de pagamento por PIX.

Configuração:

```ts
payments: {
  pixKey: "",
}
```

Criar um componente:

```text
PixPaymentModal
```

que mostre:

* chave Pix
* nome do recebedor
* botão "Copiar chave"
* QR Code, se configurado
* mensagem explicativa

O QR Code pode posteriormente ser gerado dinamicamente.

---

# 18. RSVP

Criar uma página:

```text
/confirmar-presenca
```

ou:

```text
/rsvp
```

Formulário:

```text
Nome completo *
Vai comparecer?
Quantidade de adultos
Nome dos acompanhantes
Quantidade de crianças
Nome das crianças
E-mail
Telefone
Observações
```

Inspirar-se na experiência do site de referência, que coleta nome, presença, adultos, acompanhantes, crianças, e-mail, telefone e observações.

---

# 19. Banco de dados — Supabase

Utilizar Supabase/PostgreSQL.

O banco será utilizado inicialmente para:

### guests

```text
id
created_at
name
email
phone
attending
adults
children
companions
children_names
notes
```

### guest_messages

```text
id
created_at
guest_name
message
approved
```

### gifts

Opcional inicialmente.

```text
id
title
description
value
image
payment_url
active
```

### payments

Somente se a integração oficial do Mercado Pago for implementada:

```text
id
gift_id
external_payment_id
payer_name
amount
status
payment_method
created_at
updated_at
```

---

# 20. Segurança do Supabase

Utilizar Row Level Security.

O visitante público deverá conseguir:

* enviar RSVP
* enviar mensagem

Mas NÃO deverá conseguir:

* listar todos os convidados
* editar RSVP de outras pessoas
* listar pagamentos
* alterar presentes
* alterar configurações

A documentação do Supabase recomenda RLS para proteger tabelas quando a aplicação acessa dados através da API.

---

# 21. Painel administrativo

Criar arquitetura preparada para um painel administrativo futuro.

Rota:

```text
/admin
```

Inicialmente pode existir somente uma página protegida ou até ficar desabilitada.

Planejar posteriormente:

```text
/admin
/admin/convidados
/admin/presentes
/admin/mensagens
/admin/pagamentos
```

O administrador deverá conseguir visualizar:

* total de convidados
* confirmados
* recusados
* adultos
* crianças
* presentes recebidos
* valor arrecadado
* mensagens

---

# 22. Confirmação de presença

Depois do envio:

Mostrar uma tela elegante:

```text
Obrigado, NOME! ❤️

Sua presença foi registrada.

Estamos muito felizes em ter você
com a gente nesse momento.
```

Se respondeu "não":

```text
Sentiremos sua falta! ❤️

Obrigado por nos avisar.
```

---

# 23. Galeria

Criar uma galeria responsiva.

Utilizar:

```text
/public/images/galeria/
```

Exemplo:

```text
imagem-galeria-01.webp
imagem-galeria-02.webp
imagem-galeria-03.webp
...
```

Funcionalidades:

* grid responsivo
* lightbox
* navegação entre fotos
* lazy loading

---

# 24. Seção de mensagens

Criar espaço para convidados deixarem mensagens.

Campos:

```text
Nome
Mensagem
```

Após envio:

```text
Mensagem enviada!
```

As mensagens deverão inicialmente possuir:

```text
approved = false
```

para permitir moderação futura.

Não mostrar mensagens diretamente antes da aprovação.

---

# 25. Informações úteis

Criar seção opcional:

## Hospedagem

Lista de hotéis.

## Trajes

Informação sobre dress code.

## Estacionamento

Informações.

## Salão / beleza

Informações.

## Transporte

Informações.

Tudo deverá ser configurável.

---

# 26. Música

Opcionalmente permitir música ambiente.

IMPORTANTE:

Não iniciar música automaticamente com volume alto.

Se houver música, criar botão discreto:

```text
🔊 Música
```

O visitante controla:

* play
* pause
* volume

---

# 27. Responsividade

Prioridade máxima para mobile.

Breakpoints:

* mobile
* tablet
* desktop
* wide desktop

Testar pelo menos:

```text
375px
390px
430px
768px
1024px
1440px
1920px
```

Nenhum elemento pode:

* gerar scroll horizontal
* sair da tela
* quebrar texto
* sobrepor botões
* criar layout impossível de usar no celular

---

# 28. Performance

Utilizar:

* Next/Image
* lazy loading
* compressão adequada de imagens
* WebP/AVIF quando possível
* carregamento otimizado de fontes
* Server Components quando possível

Evitar bibliotecas desnecessárias.

Objetivo:

Excelente performance no Lighthouse.

---

# 29. SEO

Adicionar:

```text
title
description
Open Graph
Twitter Card
favicon
```

Exemplo:

```text
NOME & NOME | Nosso Casamento
```

Criar também:

```text
robots.txt
sitemap.xml
```

---

# 30. Compartilhamento WhatsApp

Adicionar botões para compartilhamento.

Mensagem configurável:

```text
Estamos muito felizes em compartilhar nosso grande dia com você! ❤️

Confira todas as informações do nosso casamento:

[URL]
```

---

# 31. Domínio

O projeto deve estar preparado para domínio próprio.

Exemplo:

```text
www.nomeenome.com.br
```

O domínio deverá apontar para a aplicação hospedada na Vercel.

Não utilizar domínio da plataforma de casamento.

---

# 32. Hospedagem

Utilizar Vercel como primeira opção.

Fluxo:

```text
GitHub
   ↓
Vercel
   ↓
Next.js
```

A Vercel possui integração direta com Next.js e deploy automático a partir do repositório.

---

# 33. Banco público

Não deixar o banco "aberto".

O site será público, mas o banco NÃO.

Utilizar:

```text
Supabase
+
Row Level Security
+
Server-side operations
```

O visitante deve acessar somente aquilo que é necessário.

---

# 34. Configuração de desenvolvimento

Criar README.md contendo:

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Produção

```bash
npm start
```

Explicar:

* como criar Supabase
* como configurar `.env`
* como configurar Mercado Pago
* como executar migrations
* como adicionar imagens
* como editar dados do casamento
* como editar presentes
* como alterar cores
* como fazer deploy na Vercel
* como configurar domínio

---

# 35. Princípio importante de configuração

O usuário deverá conseguir alterar:

* nomes
* data
* horário
* local
* endereço
* links
* WhatsApp
* Instagram
* PIX
* textos principais
* cores
* imagens
* presentes
* valores dos presentes
* links de pagamento

sem precisar procurar valores espalhados pelo código.

Sempre que possível, colocar essas informações em:

```text
/config
```

---

# 36. Não hardcodar informações

Evitar:

```tsx
<h1>João & Maria</h1>
```

Preferir:

```tsx
<h1>{weddingConfig.couple.displayName}</h1>
```

Evitar:

```tsx
const weddingDate = "2027-08-21";
```

Preferir:

```tsx
const weddingDate = weddingConfig.wedding.date;
```

Evitar links diretamente nos componentes.

Centralizar configurações.

---

# 37. Componentização

Criar componentes reutilizáveis:

```text
Countdown
Hero
Navbar
SectionTitle
StoryTimeline
WeddingDetails
LocationCard
GiftCard
GiftGrid
PaymentButton
PixModal
RsvpForm
Gallery
Lightbox
GuestMessageForm
Footer
```

Nenhum componente deve possuir lógica gigante.

---

# 38. Acessibilidade

Implementar:

* HTML semântico
* labels nos inputs
* foco visível
* navegação por teclado
* alt text nas imagens
* contraste adequado
* aria-label quando necessário
* botões reais para ações

---

# 39. Tratamento de erros

Todos os formulários deverão possuir:

### Loading

```text
Enviando...
```

### Sucesso

```text
Tudo certo! ❤️
```

### Erro

```text
Não foi possível enviar.
Tente novamente.
```

Nunca deixar o usuário sem feedback.

---

# 40. Proteções contra spam

No RSVP e mensagens:

* validação server-side
* validação client-side
* rate limiting básico
* honeypot ou mecanismo equivalente
* sanitização dos dados

Não confiar somente na validação do frontend.

---

# 41. Analytics

Preparar estrutura para Google Analytics ou outra ferramenta posteriormente.

Não adicionar scripts de analytics se não houver configuração.

Utilizar variável/configuração:

```ts
analytics: {
  enabled: false,
  googleAnalyticsId: "",
}
```

---

# 42. Consentimento / privacidade

Como haverá coleta de:

* nome
* telefone
* e-mail
* presença
* informações sobre acompanhantes

criar uma pequena mensagem de privacidade no formulário.

Não coletar informações que não sejam necessárias.

---

# 43. Fluxo completo do convidado

Experiência esperada:

```text
ABRE O SITE
     ↓
HERO
     ↓
VÊ DATA + CONTAGEM REGRESSIVA
     ↓
CONHECE A HISTÓRIA
     ↓
VÊ LOCAL / HORÁRIO
     ↓
CONFIRMA PRESENÇA
     ↓
CONHECE A LISTA
     ↓
ESCOLHE UM PRESENTE
     ↓
PAGA VIA MERCADO PAGO OU PIX
     ↓
RETORNA AO SITE
     ↓
TELA DE AGRADECIMENTO
```

---

# 44. Experiência da lista de presentes

A lista deverá ser divertida.

Não apresentar como uma loja tradicional.

Exemplo:

```text
💍 NOSSA LISTA

Como já temos quase tudo que precisamos,
decidimos transformar nossa lista em
pequenas contribuições para nossa vida
de casados.

Você escolhe o motivo.
Nós prometemos usar o dinheiro com sabedoria.

(ou não.)
```

Depois:

```text
[ TODOS ]

[ ATÉ R$ 100 ]

[ R$ 100 - R$ 500 ]

[ R$ 500+ ]
```

Cards com:

* imagem
* nome
* descrição
* valor
* botão

---

# 45. Easter eggs

Adicionar pequenos elementos divertidos.

Exemplos:

* mensagens aleatórias ao clicar em determinados elementos
* presente "misterioso"
* animação especial ao escolher um presente
* frases engraçadas

Esses elementos devem ser discretos e não prejudicar a experiência.

---

# 46. Mobile first

O site deve ser projetado primeiro para celular.

A experiência no celular é prioritária porque grande parte dos convidados provavelmente acessará através do WhatsApp.

---

# 47. Critérios de aceite

O projeto só será considerado concluído quando:

* [ ] Site funciona em desktop
* [ ] Site funciona em mobile
* [ ] Não existe scroll horizontal
* [ ] Todas as imagens são substituíveis pela pasta `/public/images`
* [ ] Dados do casal ficam centralizados em configuração
* [ ] Data fica centralizada em configuração
* [ ] Locais ficam centralizados em configuração
* [ ] Links de pagamento ficam centralizados em configuração
* [ ] Presentes são facilmente editáveis
* [ ] RSVP funciona
* [ ] Dados do RSVP são persistidos no Supabase
* [ ] RLS está configurado
* [ ] Lista de presentes funciona
* [ ] Links de pagamento funcionam
* [ ] PIX funciona
* [ ] Não existem credenciais secretas no frontend
* [ ] `.env.example` existe
* [ ] README existe
* [ ] Build de produção funciona
* [ ] Deploy na Vercel funciona
* [ ] SEO básico está configurado
* [ ] Open Graph está configurado
* [ ] Acessibilidade básica está implementada
* [ ] Formulários possuem tratamento de erro
* [ ] Site possui boa performance

---

# 48. Ordem de implementação

Não tentar construir tudo de uma vez.

Implementar nesta ordem:

### Fase 1 — Fundação

1. Criar projeto Next.js
2. Configurar TypeScript
3. Configurar Tailwind
4. Criar estrutura de pastas
5. Criar `wedding.ts`
6. Criar tema
7. Criar sistema de imagens
8. Criar layout global

### Fase 2 — Site

9. Navbar
10. Hero
11. Countdown
12. História
13. Timeline
14. Cerimônia
15. Recepção
16. Mapa
17. Galeria
18. Footer

### Fase 3 — Lista

19. Modelo Gift
20. GiftCard
21. GiftGrid
22. Filtros
23. Configuração dos presentes
24. Links de pagamento
25. PIX

### Fase 4 — Backend

26. Criar projeto Supabase
27. Criar migrations
28. Criar tabelas
29. Configurar RLS
30. Criar RSVP API
31. Criar RSVP frontend
32. Criar mensagens

### Fase 5 — Pagamentos avançados

33. Criar abstração PaymentProvider
34. Preparar Mercado Pago
35. Criar Checkout Pro ou integração equivalente
36. Criar webhooks
37. Registrar pagamentos
38. Tela de sucesso
39. Tela de pagamento pendente
40. Tela de pagamento recusado

### Fase 6 — Produção

41. SEO
42. Open Graph
43. Performance
44. Acessibilidade
45. Testes
46. GitHub
47. Vercel
48. Domínio
49. Teste final mobile
50. Teste final de pagamentos

---

# 49. Decisão arquitetural importante

NÃO implementar imediatamente um checkout de cartão totalmente customizado.

Primeiro entregar:

```text
Site
+
Supabase
+
RSVP
+
Lista
+
PIX
+
Links de pagamento
```

Depois, se necessário, implementar:

```text
Site
   ↓
Mercado Pago Checkout
   ↓
Webhook
   ↓
Supabase
   ↓
Dashboard
```

O Mercado Pago oferece tanto Checkout Pro, com página de pagamento hospedada e retorno ao site, quanto Checkout Transparente, que permite uma experiência de pagamento dentro do próprio site.

A recomendação para a primeira versão é usar **Checkout Pro ou links de pagamento**, evitando complexidade desnecessária.

---

# 50. Resultado esperado

O resultado final deverá parecer um site profissional de casamento, e não um projeto técnico.

O visitante não deve perceber:

* Next.js
* Supabase
* Vercel
* API
* banco de dados
* Mercado Pago

Ele deve perceber apenas:

```text
"Que site bonito dos noivos."
```

O projeto deve ser simples para o casal manter e suficientemente bem estruturado para crescer depois do casamento.

A prioridade é:

1. Experiência do convidado
2. Visual
3. Mobile
4. Facilidade de configuração
5. Segurança
6. Pagamentos
7. Manutenção
8. Performance
