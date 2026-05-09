
# Hashpo — SaaS Rede Social de Corrida

Escopo enorme. Vou dividir em **5 fases entregáveis** para não quebrar o projeto e gastar créditos de forma controlada. Cada fase é utilizável sozinha.

---

## Fase 1 — Ajustes visuais imediatos + base de subdomínios
*Curta, ~1 iteração. Já dá pra publicar.*

- Centralizar o Porsche no banner (`PorscheGT3Banner`) deixando porta/capô/traseira visíveis para sponsor.
- Pista lateral (`InfiniteSideTrack`): número **acima** do carro, sponsor **abaixo**, nada em cima do carrinho (já está, vou polir contraste/tamanho).
- Roteamento por subdomínio: detector em `src/lib/subdomain.ts` que lê `window.location.hostname`:
  - `slug.hashpo.com` → renderiza `/racing/profile/:slug`
  - `7.hashpo.com` (numérico) → renderiza piloto pelo número do carro
  - `hashpo.com` / preview → home normal
- Documentar no README o DNS wildcard `*.hashpo.com` → A `185.158.133.1` + TXT `_lovable`.

## Fase 2 — Rede social (feed estilo X com tema corrida)
- Nova rota `/feed` (timeline global) e `/u/:slug` (perfil público de piloto).
- Tabelas novas:
  - `follows (follower_id, pilot_id)`
  - `pilot_posts` já existe → adicionar `video_url`, `embed_kind` (youtube/x/mp4), `parent_post_id` (replies), `reposts`.
  - `post_likes (post_id, user_id)` para like real (hoje é counter).
- Componentes: `FeedComposer` (texto + embed YouTube/X), `PostCard` com overlay de carro do autor, `SuggestedPilots` (carrinhos com #número e sponsor — visual igual à pista).
- Embed seguro de YouTube e X via `<iframe>` com sandbox.

## Fase 3 — Scuderias, assentos e ranking
- Tabelas:
  - `scuderias` (400 registros seed) — nome, logo, cor, owner_id (empresa que aluga), tier.
  - `seats` (3 por scuderia = 1200) — `scuderia_id`, `pilot_id NULL`, `price`, `status` (free/owned/auctioning).
  - `championship_results` (pilot_id, week, points, position, prize_amount).
- Página `/scuderias` (grid das 400) e `/scuderias/:slug` com 3 assentos.
- Botão "Comprar assento" (UI simulada nesta fase, valor só visual).
- `/ranking` com top 20 + premiação calculada (tabela de prêmios em `prize_pool`).

## Fase 4 — Sponsor marketplace + leilão de slugs (UI + estado, sem cobrança)
- Tabelas:
  - `sponsor_slots` (kind: hood/door/wing/car_number/video_overlay, scope: pilot/scuderia/video/global, current_sponsor_id, expires_at, rate_per_hour/day/month).
  - `sponsor_bids` (slot_id, bidder_id, amount, expires_at).
  - `slug_auctions` (slug, current_bid, current_bidder, ends_at, status).
- Páginas:
  - `/marketplace/slugs` — leilão de slugs (slug.hashpo.com / N.hashpo.com).
  - `/marketplace/sponsors` — vitrine de espaços (porta de carro, vídeo pit-stop, etc.) com tarifa hora/dia/mês.
- Hook em tempo real (Supabase realtime) para atualizar lances ao vivo.
- **Sem Stripe nesta fase** — só persistimos lances, mostramos "Pagamento em breve".

## Fase 5 — Corridas interativas com sponsor sobreposto
- Player híbrido:
  - **YouTube embed** (`react-youtube`) com camada absoluta de overlays.
  - **MP4 próprio** (Supabase Storage bucket `race-videos`).
- Timeline JSON por vídeo: `[{at: 12.3, kind: "pit", sponsor_slot_id, car_number}]`.
- Overlays HTML/CSS por cima: lower-third do sponsor que ganhou o leilão da janela (Pit/Overtake/Win).
- Cockpit admin (`PilotAdminControls` já existe) ganha ações pagas:
  - Pneu novo $3, gasolina aditivada $3, nitro $5, defender, ultrapassar, pit stop.
  - Cooldown + log de eventos no `race_events`. **Valor só visual nesta fase** (Stripe depois).

---

## Detalhes técnicos

```text
src/
  lib/subdomain.ts          # parse de slug.hashpo.com / N.hashpo.com
  pages/
    Feed.tsx                # timeline global
    Scuderias.tsx           # grid 400
    ScuderiaDetail.tsx
    Ranking.tsx
    MarketplaceSlugs.tsx
    MarketplaceSponsors.tsx
  racing/components/
    FeedComposer.tsx
    PostCard.tsx
    SuggestedPilots.tsx
    SlugAuctionCard.tsx
    SponsorSlotCard.tsx
    RaceVideoPlayer.tsx     # YouTube + mp4 + overlays
```

Stack adicional: nenhum pacote novo necessário (já temos `@supabase/supabase-js`, shadcn, react-router). Para YouTube uso `<iframe>` simples (sem dep).

DNS wildcard exigido para Fase 1 funcionar em produção:
```text
*.hashpo.com  A   185.158.133.1
hashpo.com    A   185.158.133.1
_lovable      TXT lovable_verify=...
```
Em preview (`*.lovable.app`) o detector cai no fallback `/racing/profile/:slug`.

---

## O que vou fazer AGORA (esta resposta)

Apenas a **Fase 1** completa: centralizar o Porsche, polir a pista lateral e criar o helper de subdomínio com roteamento condicional em `App.tsx`. As fases 2-5 viram migrations + páginas em iterações seguintes (uma fase por mensagem sua, pra eu não inflar tudo num commit gigante).

Confirma que posso começar pela Fase 1 agora?
