# Implementation Plan — Novel Storyboard Workshop

- [x] 1. Scaffold the project
  - [x] 1.1 Create a fresh Next.js + Tailwind app in a NEW repo (created after
    Oct 30, 2026); commit `.kiro/` at the repo root, never gitignore it
  - [x] 1.2 Add the gothic theme tokens (colors, serif headings) and the
    single-page layout shell
- [x] 2. Backend: storyboard API
  - [x] 2.1 Add `POST /api/storyboard`: prompt Gemini for 8–12 shots as
    strict JSON, using the server-side API key from env
  - [x] 2.2 Add one retry on JSON parse failure; return a Chinese error
    message on final failure
- [x] 3. Frontend: input and generation
  - [x] 3.1 Paste box with character count, 500-char minimum hint, Generate
    button with loading state
  - [x] 3.2 "Try the sample" button loading the first ~1500 chars of the
    sample chapter
- [x] 4. Frontend: shot cards and export
  - [x] 4.1 Shot cards in a timeline: number, scene, camera, dialogue,
    narration, mood, duration; click to expand full visual prompt + copy
  - [x] 4.2 Export Markdown download + Copy-to-clipboard; save last 5
    generations to localStorage
- [ ] 5. Polish and submit
  - [x] 5.1 Mobile check (no horizontal scroll), empty/error states in Chinese
  - [ ] 5.2 Deploy the app, record a <3 min demo video, write the
    "How I used Kiro" note, submit before Dec 5, 07:00 JST
