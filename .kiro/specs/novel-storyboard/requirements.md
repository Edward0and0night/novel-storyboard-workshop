# Requirements Document — Novel Storyboard Workshop

## Introduction
A single-page web app for fiction writers: paste a novel chapter (Chinese),
and get back a shot-by-shot storyboard table for a vertical short drama —
shot list, camera, dialogue/narration, visual prompt, mood and estimated
duration per shot. Gothic dark UI (Costume Contest track). No login, no
database; history kept in localStorage only.

## Glossary
- Chapter: pasted Chinese fiction text, 500–6000 characters.
- Shot: one storyboard row: number, scene, camera move, dialogue/narration,
  visual prompt (for image/video generation), mood, duration seconds.
- Export: download the storyboard as Markdown, or copy it to clipboard.

## Requirements

### Requirement 1 — Paste chapter and generate
**User Story:** As a writer, I want to paste my chapter and get a storyboard,
so I can plan shots without writing the table by hand.

#### Acceptance Criteria
1. WHEN the user pastes Chinese text (500–6000 chars) and clicks Generate,
   THEN the app calls the backend and shows a loading state within 1 second.
2. WHEN generation succeeds, THEN 8–12 shots are shown as cards in order.
3. WHEN the text is shorter than 500 characters, THEN a friendly Chinese
   hint is shown and no API call is made.
4. WHEN the API fails, THEN a Chinese error message is shown and the pasted
   text is kept.

### Requirement 2 — Storyboard cards
**User Story:** As a writer, I want each shot readable at a glance, so I can
scan the whole chapter's shots in one screen.

#### Acceptance Criteria
1. WHEN shots are shown, THEN each card shows shot number, scene, camera,
   dialogue/narration, visual prompt, mood tag and duration.
2. WHEN the user clicks a card, THEN it expands to show the full visual
   prompt and a copy button.
3. WHEN the chapter has dialogue, THEN dialogue lines are kept verbatim in
   the shot, not paraphrased.

### Requirement 3 — Export
**User Story:** As a writer, I want to take the storyboard out of the app,
so I can use it in my video production workflow.

#### Acceptance Criteria
1. WHEN the user clicks Export Markdown, THEN a `.md` file downloads with
   one table row per shot.
2. WHEN the user clicks Copy, THEN the whole storyboard is copied as
   Markdown text.

### Requirement 4 — Sample chapter
**User Story:** As a first-time visitor, I want a one-click sample, so I can
see what the app does without typing.

#### Acceptance Criteria
1. WHEN the user clicks "Try the sample", THEN the first ~1500 characters
   of the novel chapter "超时罚五十，投诉扣三天" are loaded into the input.
2. WHEN the sample is generated, THEN the shots match that chapter's plot
   (delivery rider Qi Yue, late order, system "256").

### Requirement 5 — Gothic UI (Costume Contest)
**User Story:** As a visitor, I want the interface to feel like a gothic
storybook, so the design itself is part of the entry.

#### Acceptance Criteria
1. WHEN the app loads, THEN the theme is dark gothic: near-black background,
   bone-white text, blood-red accents, serif display type for headings.
2. WHEN the app is used on a phone, THEN the layout stays usable with no
   horizontal scrolling.

### Requirement 6 — Gemini backend
**User Story:** As the developer, I want the model call on the server, so
the API key is never exposed in the browser.

#### Acceptance Criteria
1. WHEN Generate is clicked, THEN the browser calls `POST /api/storyboard`
   and never sees the API key.
2. WHEN the model returns non-JSON text, THEN the server retries once with
   a "return JSON only" instruction before failing.
3. WHEN the model returns shots, THEN durations sum to roughly 60–120 seconds.
