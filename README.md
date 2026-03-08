# .bot! — Autonomia Operacional com IA

Landing page dark-theme para serviço de automação com Inteligência Artificial.

## Estrutura

```
dotbot/
├── index.html   # Estrutura HTML
├── style.css    # Estilos (dark theme, animações, responsivo)
├── script.js    # Interações (cursor, marquee, canvas, contadores)
└── README.md
```

## Como rodar localmente

Abra o `index.html` diretamente no browser, ou use um servidor local:

```bash
npx serve .
# ou
python3 -m http.server 8080
```

## Stack

- HTML5 / CSS3 / JavaScript puro (sem dependências)
- Fontes: Bebas Neue, DM Sans, DM Mono (Google Fonts)
- Canvas API para animações de partículas e grid

## Seções

1. **Hero** — headline com typewriter, canvas grid animado
2. **Marquee** — faixa infinita com frases da marca
3. **Impact** — contadores animados com IntersectionObserver
4. **Features** — 6 cards de capacidades
5. **Architecture** — pipeline de 4 etapas com canvas animado
6. **Pricing** — 3 planos (Starter, Growth, Custom)
7. **CTA Final** — chamada com canvas scan-lines
8. **Footer** — centralizado com info legal

## Responsivo

- Desktop: ≥ 1100px
- Tablet: 768px – 1099px
- Mobile: ≤ 767px / ≤ 480px
