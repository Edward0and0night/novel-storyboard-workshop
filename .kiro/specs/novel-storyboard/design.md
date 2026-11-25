# Design Document — Novel Storyboard Workshop

## Overview
Next.js (App Router) + Tailwind. One page, one API route. No database.
Frontend: paste box → shot cards → export bar. Backend: `POST
/api/storyboard` calls an OpenAI-compatible chat completions endpoint
(base URL `https://tokenfuture.si/v1`, model `cn:deepseek-v4.1-flash`,
key from `GEMINI_API_KEY` in `.env.local`, server-side only) with a prompt
that forces a strict JSON schema, then validates and returns it. The gateway
ignores the `system` role, so the instructions are sent in the user message.

## Architecture
- `app/page.tsx` — input, loading state, shot cards, export bar, sample button.
- `app/api/storyboard/route.ts` — builds the prompt, calls the model, parses
  JSON, retries once on parse failure, returns `{ shots: [...] }`.
- `lib/prompt.ts` — system prompt + JSON schema (Chinese output, keep
  dialogue verbatim, 8–12 shots, gothic visual-prompt style hints).
- `lib/types.ts` — `Shot` type shared by frontend and backend.
- localStorage key `storyboard-history` — last 5 generations only.

## Data Model
```ts
type Shot = {
  n: number;            // 1..12
  scene: string;        // e.g. "深夜楼梯井"
  camera: string;       // e.g. "仰拍，缓慢上摇"
  dialogue: string;     // verbatim line, or "" for silent shots
  narration: string;    // short narration / subtitle line
  visualPrompt: string; // English image prompt for generation tools
  mood: string;         // e.g. "压抑", "荒诞"
  seconds: number;      // 5..15
};
```

## UI
- Dark gothic: background #0d0b0e, panels #17131a, text #ece5d8,
  accent blood-red #a31621, gold #c9a227 for shot numbers.
- Headings in a serif display font; body in system sans for Chinese.
- Shot cards in a vertical timeline with a red thread line on the left.
- Mobile-first: single column, sticky Generate button.

## Testing Strategy
- Manual: sample chapter generates 8–12 shots, dialogue verbatim,
  durations sum 60–120s, export file opens as a readable table.
- Edge cases: 400-char input shows hint; empty API key shows config error;
  malformed model JSON triggers exactly one retry.
- Do NOT build: accounts, sharing links, image generation, payment.
