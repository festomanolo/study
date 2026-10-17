# MANOLO Backpack — Implementation Plan

Status: DRAFT for approval. No code has been changed yet.
Scope of v1: Computer Science, Form 1 and Form 2, aligned to the TIE *Computer Science Syllabus for Ordinary Secondary Education Form I–IV (2023)*.
Flagship: Form 2 — Computer Programming (syllabus 2.2, 50 periods).

---

## 1. Vision and success criteria

A Tanzanian student opens a school bag, unzips it, picks a notebook, watches it open to a contents page, taps a sub-topic, and learns through hand-written notes plus a live, physics-driven lab. It must feel like a real exercise book, work on a cheap Android phone with little data, and be strong enough to show donors and grant reviewers.

Success criteria (measurable):

| # | Criterion | Target |
|---|-----------|--------|
| 1 | Bag → notebook → topic → lab flow works end-to-end with no dead ends | 100% of Form 1 + Form 2 units reachable |
| 2 | Frame rate on a low-end phone (e.g. 2 GB RAM, Android 10, Chrome) | ≥ 45 fps in scenes, ≥ 30 fps worst-case in heavy labs |
| 3 | First load size (gzip, excluding audio) | ≤ 500 KB JS+CSS, ≤ 1.5 MB total first paint assets |
| 4 | Works fully offline after first visit | Yes (PWA) |
| 5 | Every page tagged with a syllabus code | 100% |
| 6 | Bilingual layer (EN notes, SW margins) on every page | 100% |
| 7 | Every sub-topic has ≥ 1 interactive lab and ≥ 3 practice questions | 100% |
| 8 | Accessibility: keyboard navigable, reduced-motion mode, readable contrast | WCAG AA on UI chrome |

---

## 2. Syllabus map (source of truth)

Source: TIE Computer Science Syllabus I–IV (12/07/2023). Two 40-minute periods per week. Continuous assessment 30%, Form IV national exam 70%; Form II national assessment carries 10%.

### Form 1 — 72 periods

| Code | Specific competence | Learning activities | Periods |
|------|---------------------|--------------------|---------|
| F1-1.1 | Understand the concept of Computer Science | (a) meaning, importance, application; (b) related fields: IT, ICT, IS, Computer Engineering | 8 |
| F1-1.2 | Understand computer systems | (a) meaning, types, functions, significance; (b) hardware: meaning, components, functions, generations; (c) software: meaning, types, functions; (d) system handling: safety, management, cleanliness, data backup, utilities | 28 |
| F1-1.3 | Maintenance and troubleshooting | (a) install simple software; (b) organise files in different OSes (Windows, Linux) | 6 |
| F1-2.1 | Principles of problem solving | (a) steps in solving a problem with computers; (b) principles of algorithms; (c) design an algorithm with flowcharts and pseudocode | 30 |

### Form 2 — 70 periods

| Code | Specific competence | Learning activities | Periods |
|------|---------------------|--------------------|---------|
| F2-1.5 | Internet and basic cyber security | (a) concept of internet and cyber security (ethics, security, privacy); (b) internet services: searching, WWW, email; (c) threats and countermeasures; (d) ethical issues and practices; (e) basic measures: passwords, safe browsing, netiquette | 20 |
| F2-2.2 | Basic principles of computer programming | (a) concept of a programming language (categories, etc.); (b) programming tools: compiler/interpreter, text editor, IDE, debugger; (c) install and configure the chosen language; (d) write, compile/run and debug a simple program; (e) variables, constants, data types, operators, expressions; (f) syntax and constructs: branching (and iteration); (g) debugging programs | 50 |

Note on (a): the extracted text for 2.2(a) is partly cut off in the PDF text layer. Verify wording and any loop/iteration items against the printed PDF before authoring content (task P0-3).

Teaching language: **Python** (syllabus permits "C, Python, etc."). Reasons: readable, short syntax, standard in the TIE Form 2 resources, easy to run in-browser.

Period allocation drives page counts (≈ 1 notebook page per 1–1.5 periods of content, minimum 1 lab per sub-topic):

| Unit | Periods | Target pages |
|------|---------|--------------|
| F2-2.2 | 50 | 36–42 |
| F2-1.5 | 20 | 14–16 |
| F1-1.2 | 28 | 20–24 |
| F1-2.1 | 30 | 22–26 |
| F1-1.1 | 8 | 6 |
| F1-1.3 | 6 | 5 |

---

## 3. Product design

### 3.1 Scenes and navigation

```
BOOT → BACKPACK → NOTEBOOK COVER → CONTENTS → PAGE (+ LAB) → CHECKPOINT
                       ↑______________back / zip bag________________|
```

1. **Boot / splash (≤ 1.5 s):** MANOLO stamp writes itself, bag drops into frame with physics. Skippable. Remembers "seen" state.
2. **Backpack scene**
   - Bag rendered as layered SVG/canvas (body, flap, straps, zipper, pocket) on a classroom-floor or desk background.
   - Level selector as a luggage tag: Form 1 | Form 2.
   - Gesture: drag the zipper pull along its track; zipper teeth animate open (spring-damped pull, teeth separate progressively).
   - Notebooks slide up as spines. Each shows subject, form, colour. v1: Computer Science live; other subjects shown as dim "Coming soon" books (marketing value, shows roadmap).
   - Tap/drag a notebook: lifts out with physics (impulse, tilt, shadow growth), then glides to centre.
3. **Notebook cover scene**
   - 3D cover with title, form, student-name line (editable), syllabus badge, school-style label.
   - Cover opens by drag or tap (hinged rotation, spring overshoot, page-block shadow reveal).
4. **Contents page ("Yaliyomo / Table of Contents")**
   - Handwritten list of units → sub-topics, with periods and a progress mark (pencil tick when done).
   - Tapping a sub-topic: pages riffle (fast-flip animation with blur-free motion) to the target page.
5. **Notebook page**
   - Ruled paper, ink, margins, micro-jitter, Swahili pencil margin (ported from current app).
   - **Lab panel** ("Maabara"): either inline diagram or a pull-out half-sheet that slides from the bottom. Interactive.
6. **Checkpoint pages:** NECTA-style red-pen graded quizzes per unit.
7. **Settings drawer:** language layer, voice speed, reduced motion, quality mode (auto/low/high), ink colour, reset progress.

### 3.2 Page types

| Type | Purpose | Example |
|------|---------|---------|
| `notes` | Handwritten explanatory page | "What is a variable?" |
| `lab` | Page dominated by an interactive simulator | Variable boxes |
| `diagram` | Annotated diagram with hotspots | Motherboard (ported) |
| `practice` | Fill-in, drag-drop, code-arrange exercises | Order the steps |
| `checkpoint` | NECTA-style graded test with red pen | Unit test |
| `summary` | "Key points" recap page with exam keywords | End of sub-topic |

### 3.3 Learning loop per sub-topic

1. Hook (story/analogy from local life, ≤ 3 lines).
2. Notes (official English terms).
3. Pencil margin (Swahili meaning, local analogy, exam keyword).
4. Lab (do it, break it, see why).
5. Practice (3–5 items, instant feedback).
6. Summary + NECTA keywords.
7. Checkpoint after each unit.

### 3.4 Visual direction

Keep the current identity: warm paper, ballpoint ink, red margins, Kalam / Patrick Hand / Caveat fonts, dark desk surroundings. New: tactile bag fabric, stitching, brass zipper, sticker-style badges. Motion language borrowed from the `apple-design` skill: springs, interruptible gestures, momentum, restraint.

---

## 4. Technical architecture

### 4.1 Stack decisions

| Concern | Choice | Why |
|---------|--------|-----|
| Build | Vite + TypeScript | Fast dev, small bundles, type safety for content schema |
| UI framework | None (vanilla TS modules + small component helpers) | Smallest payload, best for low-end phones |
| Rendering | DOM + CSS 3D for notebook; `<canvas>` (2D) for physics scenes | CSS 3D keeps text crisp; canvas keeps many bodies fast |
| Physics | Matter.js (2D rigid body, constraints, composites) | Mature, small (~80 KB min), has constraints for zipper/cloth |
| Choreography | GSAP (core only) | Reliable timelines, easing, interruptible tweens |
| Code engine | Custom Python-subset interpreter (TS) | Step events drive visuals; tiny; offline; deterministic |
| Optional full Python | Pyodide, lazy-loaded behind an "Advanced" flag | Real Python for later; heavy (~10 MB), so not default |
| Audio | Web Speech API + Web Audio chimes (existing), plus optional pre-recorded Swahili clips later | Zero video bandwidth |
| Storage | `localStorage` (progress, settings) + IndexedDB (later: notes) | Offline, no backend |
| Offline | Service worker via Vite PWA plugin (Workbox) | Full offline after first load |
| Tests | Vitest (unit), Playwright (e2e + visual snapshots) | Covers interpreter correctness and flows |
| Lint/format | ESLint + Prettier | Consistency |
| Hosting | Static (GitHub Pages / Netlify / Cloudflare Pages) | Free, fast |

Rejected: React/Vue (payload and complexity), Three.js (overkill for 2.5D; revisit only for the backpack if 3D proves necessary), Unity/Flutter (not web-first).

### 4.2 Directory layout

```
study/
├─ index.html
├─ package.json  tsconfig.json  vite.config.ts
├─ public/
│  ├─ manifest.webmanifest   icons/   fonts/ (self-hosted, subset)
│  └─ audio/ (later)
├─ src/
│  ├─ main.ts                       # boot
│  ├─ app/
│  │  ├─ router.ts                  # scene state machine + deep links (#/cs/f2/2.2/variables)
│  │  ├─ store.ts                   # settings + progress (typed, versioned, migrations)
│  │  ├─ events.ts                  # tiny typed event bus
│  │  ├─ perf.ts                    # device tier detection, FPS governor
│  │  └─ a11y.ts                    # reduced-motion, focus management
│  ├─ scenes/
│  │  ├─ boot/
│  │  ├─ backpack/ (bag.ts zipper.ts spines.ts bag.css)
│  │  ├─ notebook/ (cover.ts contents.ts pageStack.ts pageCurl.ts)
│  │  └─ page/ (renderer.ts blocks/*.ts)
│  ├─ physics/
│  │  ├─ world.ts                   # shared Matter engine wrapper, fixed timestep
│  │  ├─ springs.ts                 # critically/under-damped spring utils
│  │  ├─ cloth.ts                   # soft-body composite (flap, strap)
│  │  ├─ zipper.ts                  # chain constraint model
│  │  └─ debugDraw.ts
│  ├─ components/
│  │  ├─ pencilMargin/  stickyNote/  redPen/  voiceNote/  highlighter/
│  │  ├─ labShell/                  # common lab frame: title, controls, reset, hint
│  │  └─ quiz/                      # mcq, match, order, fill, code-arrange
│  ├─ labs/
│  │  ├─ programming/ (see §7)
│  │  ├─ internet/    (see §8)
│  │  └─ foundations/ (see §9)
│  ├─ interpreter/
│  │  ├─ lexer.ts parser.ts ast.ts
│  │  ├─ evaluator.ts               # emits StepEvents
│  │  ├─ errors.ts                  # friendly bilingual error messages
│  │  └─ stdlib.ts                  # print, input, int, str, float, len, range, ...
│  ├─ i18n/ (en.json sw.json index.ts)
│  ├─ content/ (loader.ts schema.ts validate.ts)
│  └─ styles/ (tokens.css paper.css ink.css motion.css)
├─ content/
│  └─ computer-science/
│     ├─ subject.json
│     ├─ form-1/ unit-1.1/ unit-1.2/ unit-1.3/ unit-2.1/
│     └─ form-2/ unit-1.5/ unit-2.2/
│        └─ <topic>/ topic.json  page-01.md  page-02.md ... checkpoint.json
├─ tests/ (unit/ e2e/ fixtures/)
├─ docs/ (IMPLEMENTATION_PLAN.md SYLLABUS_MAP.md CONTENT_GUIDE.md GRANT_BRIEF.md ARCHITECTURE.md)
├─ scripts/ (validate-content.ts, build-audio-index.ts, size-report.ts)
└─ legacy/ handwritten_notebook_web_app.html (kept for reference; removed after parity)
```

### 4.3 Content model (data-driven)

Content lives in `content/`, validated at build time. Authors write Markdown with a few custom directives; the build converts them to typed page objects.

```ts
type Subject  = { id: 'computer-science'; title: L10n; forms: FormRef[] };
type Unit     = { id: 'F2-2.2'; title: L10n; periods: number; syllabus: string; topics: TopicRef[] };
type Topic    = { id: string; code: string; title: L10n; pages: PageRef[]; checkpoint?: string; keywords: string[] };
type Page     = {
  id: string; type: 'notes'|'lab'|'diagram'|'practice'|'checkpoint'|'summary';
  syllabusCode: string;           // e.g. "F2-2.2(e)"
  title: L10n;
  blocks: Block[];                // paragraph, list, definition, diagram, lab, quiz...
  margin: MarginNote[];           // pencil/sticky: term -> {sw, analogy, necta}
  voice?: VoiceScript;            // text + highlight timeline
};
type L10n = { en: string; sw?: string };
```

Markdown directives (examples):

```
:::lab{id="variable-boxes" height="360"}
:::
:::define{term="variable"}
A named place in memory that stores a value that can change.
:::
:::margin{term="variable" sw="kibadilishi" analogy="Kama sanduku lenye jina..." necta="Store a value"}
```

Build step `scripts/validate-content.ts` fails CI if: a page lacks a syllabus code, a lab id is unknown, a margin term has no Swahili, or a quiz answer is missing.

### 4.4 Notebook page engine

- Reuse the proven approach: fixed 28 px line grid, 740×1068 logical page scaled to viewport, locked baselines.
- Pages are rendered lazily (current ± 2) to cap DOM size.
- Page curl: replace the flat `rotateY` flip with a **segmented bend**: page split into N vertical strips (N=12 high, 6 low-tier) each with incremental `rotateY` and shading, driven by a spring on drag progress. Gives real curl while text stays crisp. Falls back to flat flip in low mode.
- Riffle navigation: contents → distant page plays a fast multi-page flip (3–6 ghost pages) over ~600 ms.
- Ink realism ported: SVG displacement filter applied only to diagrams (not body text) on low tier for speed; jitter by deterministic seed.
- Edit mode ported (contenteditable) with notes persisted in IndexedDB.

### 4.5 Physics architecture

- One `PhysicsWorld` wrapper around Matter.js: fixed 1/60 s step with accumulator, interpolation for rendering, sleeping enabled, bodies capped per scene.
- Scenes own their canvas; world is created on scene enter, destroyed on exit (no leaks).
- Quality tiers (`perf.ts`): `low | mid | high` chosen from `deviceMemory`, `hardwareConcurrency`, a 300 ms warm-up FPS probe. Governor degrades live (fewer cloth nodes, no blur, no shadows) if FPS < 40 for 1 s.
- Determinism option: seeded RNG so labs replay identically (important for tests and demos).
- Reduced-motion: disables overshoot/shake, replaces physics with eased tweens, keeps all functionality.

### 4.6 Interpreter (Python subset) — the heart of the programming labs

Goal: real, correct, step-observable execution of student code, safely in-browser, without Pyodide.

Supported v1 language (matches syllabus 2.2):
- Literals: int, float, str, bool, None.
- Variables and assignment, augmented assignment (`+=` etc.).
- Operators: arithmetic (`+ - * / // % **`), comparison, logical (`and or not`), string `+` and `*`.
- `print()`, `input()` (modal prompt UI), `int() float() str() bool() len() type() round() abs() range()`.
- Branching: `if / elif / else`.
- Iteration: `while`, `for … in range()` (and over strings/lists) — confirm against syllabus text in P0-3; include regardless for pedagogy as "extension".
- Lists (basic), indexing, `append`, `len`.
- Comments, indentation-sensitive blocks.
- Out of scope v1: functions (maybe extension), classes, imports, file IO, exceptions beyond friendly runtime errors.

Design:
- Hand-written lexer (INDENT/DEDENT), Pratt/recursive-descent parser → AST with source spans.
- Evaluator as a **generator** yielding `StepEvent`s so UI controls pace (run, step, pause, speed).

```ts
type StepEvent =
  | { t:'line'; line:number }
  | { t:'assign'; name:string; value:Value; typ:TypeName; isNew:boolean; line:number }
  | { t:'eval'; expr:string; result:Value; line:number }
  | { t:'branch'; cond:string; taken:boolean; line:number }
  | { t:'loopIter'; i:number; line:number }
  | { t:'print'; text:string }
  | { t:'input'; prompt:string }
  | { t:'error'; kind:'SyntaxError'|'NameError'|'TypeError'|'ZeroDivisionError'|'IndentationError'; line:number; msg:L10n }
  | { t:'done' };
```

- Guards: max steps (default 20 000) and max output; infinite loop → friendly "your loop never ends" with the loop highlighted.
- Errors are rewritten into **plain bilingual explanations** ("NameError: you used `age` before giving it a value — *Hujaipa `age` thamani bado*").
- Testing: golden tests comparing outputs with CPython on a corpus of ≥ 200 snippets (run in CI via Python available locally).

Optional later: Pyodide worker for "Run real Python" toggle; same editor, different engine.

### 4.7 Code editor component

- Lightweight custom editor on a textarea + highlight overlay (≈ 5 KB) rather than Monaco/CodeMirror (too heavy for v1). Features: syntax colouring, line numbers, auto-indent, Tab = 4 spaces, error squiggle, current-line highlight during step mode, large touch-friendly keyboard helper bar (`: ( ) " = [ ] Tab`) because phone keyboards hide symbols.
- Read-only "worked example" mode, "fix the bug" mode, "arrange the lines" (Parsons) mode.
- Handwritten skin: code shown in a handwriting-style monospace on the page, but a clean mono font when editing (readability wins).

### 4.8 Internationalisation

- `en.json` / `sw.json` for UI strings; content uses inline `L10n`.
- Swahili is a **layer**, not a replacement: English notes stay exam-faithful; Swahili appears as margin notes, voice, error explanations and hints.
- Glossary file (`glossary.json`): term, EN definition, SW term, SW explanation, local analogy, NECTA keyword, pronunciation hint. Single source for margin notes and quizzes.
- Translation review workflow: every Swahili string gets `reviewed: false` until a teacher signs off (tracked in content front-matter).

### 4.9 Audio and voice

- Phase 1: Web Speech API (existing approach) with voice picker and graceful fallback to text-only if no `sw-TZ`/`sw-KE` voice exists on device (common on cheap Android). Do not rely on it for correctness.
- Phase 2 (optional, grant-funded): recorded Swahili clips, compressed Opus ≤ 16 kbps, loaded per page, cached by service worker; highlighter timeline from the existing `highlights[]` structure.
- Web Audio chimes for feedback (zip sound, page flip, correct/incorrect), generated synthetically (0 KB).

### 4.10 Progress, assessment, analytics

- Progress store: per page `seen`, per lab `completed`, per quiz best score; per topic mastery. Versioned schema + migrations.
- Red-pen engine generalised from the current page 4: takes a `Checkpoint` JSON (MCQ, match, short answer with keyword rubric, code question with test cases run in the interpreter) and animates marking.
- Short-answer marking: keyword/rubric with synonyms (EN+SW), partial credit; **no network, no AI calls**.
- Code questions: hidden test cases executed in interpreter, per-test pass/fail shown with red-pen ticks.
- Analytics: **off by default**. Optional privacy-respecting, aggregate-only mode for pilots (see §13). No personal data collected; no accounts in v1.

### 4.11 PWA / offline

- Precache app shell + all JSON content + fonts; runtime cache for audio.
- Versioned cache with update prompt ("New lessons available — tap to refresh").
- Install prompt after the second visit.
- Self-host fonts (subset Latin + Swahili diacritics) to avoid Google Fonts dependency and reduce load.

### 4.12 Performance budgets

| Item | Budget |
|------|--------|
| Initial JS (gzip) | ≤ 180 KB incl. Matter.js + GSAP core |
| Per-topic lazy chunk | ≤ 60 KB |
| Fonts (subset, woff2) | ≤ 120 KB total |
| Backpack scene first render | ≤ 1.2 s on mid-tier |
| Memory (heap) | ≤ 120 MB during heaviest lab |
| Long tasks | None > 50 ms during animations |

`scripts/size-report.ts` fails CI when budgets are exceeded.

### 4.13 Accessibility

- Every interactive element reachable by keyboard; zipper has a button alternative; page curl has Next/Prev buttons and arrow keys.
- `prefers-reduced-motion` honoured; in-app toggle too.
- Text contrast AA; dyslexia-friendly toggle swaps handwriting font for a readable sans (handwriting fonts hurt some learners).
- Labs expose state in an ARIA live region ("x is now 5").
- Font-size control (S/M/L) rescales page content without breaking the 28 px rule via CSS variable `--line-h` coupling.

---

## 5. The backpack scene — detailed spec

### 5.1 Layers (back to front)
1. Background: desk / classroom floor with soft vignette.
2. Bag back panel + inner shadow.
3. Notebooks (spines visible, partially inserted).
4. Bag front panel with pocket and stitching.
5. Flap (cloth-simulated).
6. Zipper track + pull.
7. Straps and hanging charm (a tiny Tanzanian flag keychain; swings with physics).
8. HUD: level tag, settings, language chip.

### 5.2 Physics elements
- **Zipper:** chain of ~24 tooth pairs. Pull handle is a draggable body constrained to a path; as it moves, teeth pairs separate with staggered delay (spring-damped), opening the flap angle proportionally. Releasing partway leaves partial opening; fling past 85% auto-completes. Sound: pitched ticking tied to velocity.
- **Flap:** 6×4 soft grid (Matter composite) pinned at the top; follows zipper progress; wiggles on tap.
- **Notebooks:** rigid bodies with rounded rectangles. On open they rise with impulse and settle in a fan arrangement; hover/tilt on touch; dragged one rotates toward drag velocity (angular spring), drops onto a "desk" target to select.
- **Charm / keychain:** rope constraint chain with a small mass; reacts to device tilt via `DeviceOrientation` when available (optional) and to pointer drags.
- **Ambient:** subtle idle sway so the scene feels alive; pauses when tab hidden.

### 5.3 Interaction states
`closed → opening → open → notebookLifted → transitioning`, all interruptible (user can reverse any gesture mid-way, per apple-design principle).

### 5.4 Fallbacks
Low tier: no cloth flap (rigid rotate), fewer teeth (10), no charm physics. Reduced motion: zipper becomes a toggle button with fade.

---

## 6. Notebook shell — detailed spec

- **Cover:** layered SVG (paper texture, label, ruled name box, syllabus ribbon). Hinge on the left; open by drag (rotation mapped from pointer X) with spring snap at 35% threshold. Content block "breathes" shadow as the cover lifts.
- **Contents page:** two-level list (units → sub-topics). Each row: handwritten title, dotted leader, page number, pencil tick for progress, small coloured tab for unit. Row tap → riffle to page. Swipe left/right for page turns.
- **Tabs:** side index tabs (like real dividers) for each unit; tap to jump.
- **Bookmark ribbon:** remembers last page; "Continue" button on the backpack scene.
- **Back to bag:** closing gesture (pinch/drag cover down) or button; notebook slides back into bag with matching animation.

---

## 7. Form 2 — Computer Programming (F2-2.2): flagship content and labs

Total target: ~40 pages, 12 core labs, 1 integrative project, 2 checkpoints. Each topic below lists: notes outline → lab → practice.

### T1. What is a programming language? (F2-2.2a) — ~5 pages
- Notes: computers only understand binary; humans write instructions; language as a bridge; categories (machine, assembly, high-level), examples (Python, C, JavaScript), why high-level; syntax vs semantics.
- Analogy: giving directions to a boda-boda rider — clear, ordered, exact.
- **Lab A — "Dereva wa Boda" (Instruction following):** student orders blocks (go straight, turn left…) to get a boda-boda to a destination on a Dar-like map; one wrong or ambiguous instruction fails — shows computers need exact instructions. Physics: vehicle with momentum, grid bumps.
- **Lab B — Language ladder:** slider from machine code → assembly → Python; same task (add two numbers) shown at each level, with line count and readability. Bits "fall" as binary rain into lines.
- Practice: match language to category; true/false; why high-level?

### T2. Programming tools (F2-2.2b) — ~5 pages
- Notes: text editor vs IDE; compiler vs interpreter; debugger; translator concept.
- **Lab C — Compiler vs Interpreter:** two lanes. Compiler lane translates the whole "book" of code into a machine-code box, then runs; interpreter lane reads one line, translates, runs, repeats (like an interpreter at a meeting). Hidden error shows the difference: compiler refuses to start, interpreter fails at the bad line. Physics: papers on conveyor belts, a stamping press, stack sorting.
- **Lab D — Meet the IDE:** annotated fake IDE; tap each region (editor, run button, console, debugger) to see a tooltip + Swahili; mini-quiz to place labels (reuse the active-recall drag mechanic from the current app).

### T3. Install and configure (F2-2.2c) — ~4 pages
- Notes: what installing means; installers; PATH concept (simplified); verifying with `python --version`; alternatives (online IDE, school computer lab).
- **Lab E — Install wizard simulator:** guided steps in a pretend Windows/Linux installer; student makes choices (tick "Add to PATH"), then runs a fake terminal; wrong choice produces a realistic error and teaches the fix. Works without any network.
- Practice: order the installation steps; identify the correct verification command.
- Note for classrooms without computers: all content works on a phone; no real install required.

### T4. Writing and running a first program (F2-2.2d) — ~5 pages
- Notes: structure of a program; `print()`; comments; running; output; common first errors.
- **Lab F — "Hello, Tanzania" console:** editor + console running on the real interpreter; guided tasks: print your name, print a two-line greeting, print school motto. Output text drops as physical letter tiles into the console (letters collide gently and settle — visually memorable).
- **Lab G — Run vs. step:** same program with step controls; the current line highlights on the notebook page itself ("highlighter" reuse).
- Practice: predict the output, fix the broken `print`.

### T5. Variables, constants, data types, operators (F2-2.2e) — ~9 pages (largest unit)
- Notes: variables as named memory locations; naming rules; assignment; reassigning; constants (naming convention, e.g. `PI`); data types int, float, str, bool; type conversion; arithmetic/comparison/logical operators; operator precedence; expressions; `input()`.
- **Lab H — Variable Boxes (signature lab):** memory shelf with labelled boxes. Executing `age = 15` drops a numbered tile into a box named `age`; reassigning knocks out the old tile (it falls away, fades); `b = a` copies a tile (a duplicate pops out). Mini-interpreter step-through drives it.
- **Lab I — Data type sorting:** shaped tiles (round = int, rounded square = float, speech bubble = str, switch = bool). Boxes have sockets; wrong shape physically bounces back with a "TypeError" explanation. Teaches `"5" + 5` failing.
- **Lab J — Operator workshop:** drag operators between values on a balance/scale; `==` as a scale tipping, `and`/`or` as two-gate circuits with a ball passing through; precedence shown by an "order of operations" assembly line that evaluates highest-priority first.
- **Lab K — Constants:** a padlocked box (convention + explanation that Python won't enforce it, a "gentleman's agreement"); contrast with a variable.
- **Mini-project:** "Duka calculator": input price and quantity, compute total and change in TZS.
- Practice: valid/invalid identifiers, type of each expression, trace table completion.

### T6. Syntax and constructs: branching (and loops) (F2-2.2f) — ~8 pages
- Notes: sequence, selection, iteration; `if/elif/else`; comparison and logical operators in conditions; indentation matters; nested ifs; (loops: `while`, `for`/`range` as extension if confirmed in syllabus text).
- **Lab L — Fork in the road:** a marble rolls down a track to a fork; the condition (`marks >= 50`) controls a switch; student edits the number, marble path changes; `elif` chains become multi-way sorters (grade ladder: A/B/C/D/F styled as NECTA-like grading — verify grading bands against current NECTA scheme).
- **Lab M — Indentation as rooms:** indentation shown as nested rooms with doors; mis-indented line physically ends up in the wrong room; fixing shows behaviour change.
- **Lab N — Loop conveyor (extension):** a loop body becomes a machine on a belt; `range(5)` count-down counter; items stamped each iteration; `while` with a condition lamp; infinite loop shown as a belt that never stops, then fixed.
- **Mini-project:** "Pass/Fail result printer" for a class list; "Bus fare calculator" with fare bands.
- Practice: dry-run tables, Parsons problems (arrange lines), predict output.

### T7. Debugging (F2-2.2g) — ~6 pages
- Notes: bug types (syntax, runtime, logic); reading error messages; strategies (read, print-debug, rubber-duck, trace table, divide and conquer); using a debugger (breakpoints, step).
- **Lab O — Bug Hunt:** code with seeded bugs; a bug creature sits on the faulty line; student locates, then patches; each fix squashes it with a satisfying physics splat. Three levels: syntax, runtime, logic.
- **Lab P — Trace table builder:** student fills in a variable-by-iteration table while the interpreter runs; mismatches highlighted in red pen.
- Practice: classify bug type, fix 5 snippets, explain error message in own words.

### T8. Integrative project and checkpoint — ~4 pages
- Project options (choose one): school canteen order total; grade calculator; guess-the-number game; mobile-money fee estimator (clear that it is a simulation, using simple rules).
- Rubric page mirrors TIE project expectations (competence-based): problem understanding, algorithm, code correctness, testing, reflection.
- **Unit checkpoint (NECTA-style):** Section A (MCQ + matching), Section B (short answers + trace table), Section C (write a program, auto-tested). Red-pen grading with per-test feedback. 20–40 minutes, 30 marks.

### Programming content quality rules
- Every code sample must run on the interpreter (CI enforced).
- Only local, plausible contexts: shillings, daladala fares, school marks, market prices. No fabricated brand/organisation claims; avoid real people.
- English terms stay exam-accurate; Swahili explanations aim for clarity, not literal word-for-word translation.

---

## 8. Form 2 — Internet and Cyber Security (F2-1.5) — ~15 pages

| Topic | Notes | Lab |
|-------|-------|-----|
| Internet concept, www vs internet | networks of networks, protocols, browser/server | **Packet journey:** a message split into packets travels hop-by-hop across a map; drop a router and watch rerouting (physics: packets as marbles in pipes) |
| Internet services | search, www, email | **Search smarter:** query-refinement game; **Email anatomy:** compose/to/cc/subject/attachment in a pretend inbox |
| Threats & countermeasures | malware, phishing, scams, identity theft, data loss | **Phish or Legit?** swipe-card game with realistic (fictional) SMS/emails (including mobile-money scam patterns, in generic terms); explain red flags |
| Ethics, security, privacy | cyber ethics, consent, copyright, cyberbullying | scenario cards with discussion prompts |
| Basic measures | passwords, safe browsing, netiquette | **Password strength forge:** type a password, a physical "lock" reinforces/cracks based on entropy-style rules (strictly local, never sent anywhere); **Netiquette dos/don'ts** sorting |
| Checkpoint | NECTA-style | MCQ + scenarios |

Safety notes: no real exploitation content; threats explained at awareness level appropriate to the syllabus; password lab never stores or transmits inputs (and warns students not to type real passwords).

---

## 9. Form 1 content and labs (after Form 2 flagship)

### F1-1.1 Concept of Computer Science (6 pages)
- Meaning, importance, applications (health, education, agriculture, banking, transport). Related fields: IT, ICT, IS, Computer Engineering.
- **Lab:** "Which field am I?" scenario sorter; **Where is CS around you?** hotspot picture of a Tanzanian town street (M-pesa-style kiosk is a generic "mobile money agent", bus ticketing, hospital, shamba).

### F1-1.2 Computer systems (20–24 pages)
- (a) systems: meaning, types (analog/digital/hybrid; micro/mini/mainframe/super; by purpose), functions (input-process-output-storage), significance.
  **Lab:** IPO pipeline with a toy "juice machine" analogy; type-classifier drag game.
- (b) hardware: components, functions, generations.
  **Port from current app:** CPU fetch-decode-execute flow, motherboard hotspots, RAM vs storage (volatile/non-volatile), SMPS, peripherals (input/output/storage). Rebuild with physics (e.g. RAM tiles vanish on power cut; "TANESCO load-shedding" button for the power-cut analogy).
  **Lab:** Build-a-PC: drag components to correct slots; wrong slot bounces; boot sequence animation.
  **Lab:** Computer generations timeline (vacuum tube → transistor → IC → microprocessor → AI) with size/speed scale comparison.
- (c) software: types (system, application, utility; OS roles), functions.
  **Lab:** Layer cake (hardware → OS → apps) with a request travelling down and up; sorter for software types.
- (d) system handling: safety, cleaning, backup, utilities.
  **Lab:** Lab-safety hazard spotter (spot hazards in a school computer room picture); Backup 3-2-1 sim with a "power surge/flood/theft" event that destroys storage so student learns why backup matters.

### F1-1.3 Maintenance & troubleshooting (5 pages)
- (a) Installing software: simple wizard sim (shared component with F2 Lab E).
- (b) Organising files in Windows and Linux: **File Explorer sim** with folder tree, drag/move/copy/rename, path concept (`C:\Users\...` vs `/home/...`), both OS skins.

### F1-2.1 Problem solving & algorithms (22–26 pages)
- (a) Steps to solve a problem: define, analyse, plan (algorithm), implement, test, document.
  **Lab:** "The broken tea-shop queue" problem-framing game.
- (b) Algorithms: definition, properties (finite, definite, ordered, input/output), real-life (making chai/ugali), sequence/selection/iteration.
  **Lab:** Algorithm ordering ("make a cup of chai": drag steps; wrong order physically spills).
- (c) Flowcharts and pseudocode: symbols, rules, conversion between them.
  **Lab:** **Flowchart builder:** drag symbols onto canvas, connect with arrows (snap + physics-wobble), then **run** it: a token travels the chart; compare with auto-generated pseudocode side by side.
  **Lab:** Pseudocode → flowchart matcher; common algorithms (largest of two numbers, average, even/odd, simple interest).
- Checkpoint: NECTA-style, includes design-an-algorithm with flowchart answer scoring by rubric (structure-based check: start/end present, decision has two exits, loops close).

---

## 10. Phased delivery plan with tasks and acceptance criteria

Estimates assume one full-time developer plus Claude Code pairing. Calendar time depends on content review turnaround.

### Phase 0 — Alignment and groundwork (2–3 days)
- P0-1 Restructure repo: move current HTML to `legacy/`, add `docs/`.
- P0-2 Initialise Vite + TS + ESLint + Prettier + Vitest + Playwright; CI workflow (lint, type-check, unit tests, content validation, size report).
- P0-3 Download and archive the official syllabus PDF (`docs/reference/`); manually verify 2.2(a) and iteration wording against the printed PDF; create `docs/SYLLABUS_MAP.md`.
- P0-4 Write `CONTENT_GUIDE.md` (tone, glossary rules, analogies, review flow).
- P0-5 Capture baseline screenshots of the legacy app for visual parity.
- **Accept:** `npm run dev` shows a blank shell; CI green; syllabus map approved.

### Phase 1 — Foundation systems (1 week)
- P1-1 Router and scene state machine with deep links.
- P1-2 Store (settings/progress) with versioning.
- P1-3 Design tokens, paper/ink CSS ported into modular styles; self-hosted font subsets.
- P1-4 Content schema, Markdown directive parser, validator script, loader with lazy chunks.
- P1-5 Perf/device-tier module and FPS governor.
- P1-6 i18n system + glossary format.
- P1-7 Page renderer: ruled page, blocks (paragraph, list, define, code, diagram, lab, quiz), pencil margin, sticky notes (ported).
- **Accept:** One sample topic renders from Markdown in the legacy visual style; validation fails correctly on bad content; unit tests pass.

### Phase 2 — Physics core and backpack (1.5–2 weeks)
- P2-1 `PhysicsWorld` wrapper (fixed step, interpolation, sleeping, teardown).
- P2-2 Springs and gesture utilities (interruptible drag, velocity projection, rubber-banding).
- P2-3 Bag art (SVG) and layering; theming tokens.
- P2-4 Zipper model, flap cloth, charm chain; sound design.
- P2-5 Notebook spines, lift/select physics, level tag (Form 1/2).
- P2-6 Quality tiers and reduced-motion fallbacks.
- P2-7 e2e: bag opens, notebook selectable by mouse, touch, and keyboard.
- **Accept:** Demo-ready backpack on desktop and mid-tier phone at ≥ 45 fps; keyboard alternative works; no memory growth after 20 open/close cycles.

### Phase 3 — Notebook shell (1.5 weeks)
- P3-1 Cover component with hinge physics.
- P3-2 Contents page with progress ticks and tabs.
- P3-3 Page stack with segmented curl, drag-to-turn, riffle navigation, ribbon bookmark.
- P3-4 Back-to-bag transition; "Continue where you left off".
- P3-5 Port edit mode and voice/highlighter infrastructure.
- **Accept:** Full navigation loop bag → cover → contents → page → back works smoothly; page curl follows finger; curl falls back cleanly on low tier.

### Phase 4 — Interpreter, editor, lab shell (2 weeks)
- P4-1 Lexer/parser/evaluator with step events; friendly bilingual errors.
- P4-2 Corpus tests against CPython (≥ 200 snippets, incl. error cases); infinite-loop guard.
- P4-3 Editor component (highlight, indent, helper key bar, step highlighting).
- P4-4 Console component (print/input) and `LabShell` (reset, hint, step/speed controls, ARIA live).
- P4-5 Trace recorder (powers trace tables and Variable Boxes).
- **Accept:** All corpus tests pass; editor usable on phone; step/run/reset deterministic.

### Phase 5 — Form 2 Programming flagship (4–5 weeks)
- P5-1 Author T1–T8 pages (Markdown), glossary, margin notes, voice scripts.
- P5-2 Build labs A–P in priority order: **H (Variable Boxes) → F/G (console + step) → L (Fork in the road) → I (types) → C (compiler vs interpreter) → O (bug hunt) → J → M → N → K → A/B → D/E → P**.
- P5-3 Practice components: MCQ, match, order, fill, Parsons, code-fix.
- P5-4 Red-pen engine v2 (JSON checkpoints, code tests) and unit checkpoint.
- P5-5 Integrative project pages with rubric.
- P5-6 Teacher/pilot review pass; fix wording.
- **Accept:** Student can complete the whole unit offline; every sub-topic has lab + practice + summary; checkpoint grades correctly incl. code questions; teacher review notes resolved.

### Phase 6 — Form 2 Internet and Cyber Security (2 weeks)
- P6-1 Author pages and glossary.
- P6-2 Labs: Packet journey, Phish-or-Legit, Password forge, Email anatomy, Search smarter.
- P6-3 Checkpoint.
- **Accept:** All sub-topics covered; no personal data stored; content safety review done.

### Phase 7 — Form 1 (4–5 weeks)
- P7-1 Author F1-1.1, F1-1.2, F1-1.3, F1-2.1.
- P7-2 Port and upgrade hardware diagrams (CPU, motherboard, RAM) into physics labs.
- P7-3 New labs: Build-a-PC, generations timeline, layer cake, backup sim, file explorer, flowchart builder, algorithm sorter.
- P7-4 Checkpoints per unit.
- **Accept:** Full Form 1 completable offline; flowchart builder produces correct pseudocode for 10 canonical algorithms.

### Phase 8 — Polish, QA, and launch readiness (2–3 weeks)
- P8-1 PWA install flow, update prompts, offline audit (airplane mode test).
- P8-2 Performance tuning on real low-end devices; fix budget breaches.
- P8-3 Accessibility audit (keyboard, screen reader, contrast, reduced-motion).
- P8-4 Visual regression suite; cross-browser (Chrome Android, Safari iOS, Firefox, Samsung Internet).
- P8-5 Teacher view v1 (local, exportable progress summary; no server).
- P8-6 Demo mode: scripted 3-minute walkthrough for funders; hidden "presenter" shortcut keys.
- P8-7 Grant materials (see §12).
- **Accept:** Lighthouse PWA/perf/a11y ≥ 90 on mid-tier profile; no P0/P1 bugs; sign-off checklist complete.

Rough total: 18–24 weeks solo; faster if content authoring and teacher review run in parallel.

---

## 11. Testing and quality

- **Unit:** interpreter (corpus parity), content validation, store migrations, spring/physics utilities, red-pen scoring rules.
- **Integration:** lab ↔ interpreter event wiring; quiz rendering and grading.
- **E2E (Playwright):** core journeys (bag → page → lab → checkpoint), deep links, offline mode, reduced motion, small-screen layouts (360×640, 390×844, tablet, desktop).
- **Visual snapshots:** key scenes with seeded physics for determinism.
- **Performance:** CPU-throttled Chrome (4–6×) runs in CI; FPS recorded via a perf harness; fail on regressions.
- **Content QA:** every code sample executes; glossary coverage; syllabus-code coverage report (which learning activities have pages/labs/questions).
- **Pedagogical QA:** at least two Tanzanian teachers review each unit (accuracy, level, Swahili clarity); pilot with a small group of students; capture comprehension feedback.
- **Real-device matrix:** at least one low-end Android phone, one mid-range, one iPhone, one school-lab PC.

---

## 12. Fundraising and grants support

- **GRANT_BRIEF.md:** problem (English-language transition, shortage of computers/teachers, data costs), solution, alignment to TIE 2023 syllabus, offline-first design, pilot plan, budget, risks.
- **Demo mode:** 3-minute guided flow (bag → notebook → variable boxes → bug hunt → red-pen score).
- **Evidence plan:** pre/post micro-assessments from pilot classes; teacher satisfaction survey; completion rates (local aggregates, consented).
- **Impact metrics proposal:** cost per learner, lessons completed, quiz improvement, offline usage.
- **Assets:** screen recordings, hero GIFs, one-page PDF, press-kit images, short pitch script. (Created later; I will not fabricate statistics, testimonials, or partner logos. All claims must be backed by real pilot data.)
- **Roadmap slide:** Forms 3–4 CS, other subjects (Physics, Maths, Biology), teacher dashboard with optional sync, recorded Swahili audio, community content contributions.
- Do not claim official TIE endorsement unless obtained. Describe as "aligned to the TIE 2023 syllabus".

---

## 13. Privacy, safety, and legal

- No accounts, no tracking by default; all data stays in the browser.
- Optional pilot analytics: opt-in, aggregate counts only, no identifiers; documented in a privacy note in English and Swahili.
- Child-appropriate content; no ads; no external embeds.
- Licensing: self-hosted fonts must be open-licensed (Kalam, Patrick Hand, Caveat are OFL); document third-party licences (Matter.js MIT, GSAP standard licence — verify terms for the intended distribution, or swap to a MIT alternative like Motion One / WAAPI if GSAP licensing is a concern).
- Syllabus text is quoted minimally and attributed to TIE; notes are original wording.
- Branding: the "NECTA-style" checkpoint pages are practice material modelled on exam format, clearly labelled as practice, not official papers.

---

## 14. Risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Physics heavy on cheap phones | Poor UX, drop-off | Device tiers, FPS governor, rigid fallbacks, strict body caps, early real-device testing in Phase 2 |
| Swahili speech voice missing on devices | Voice feature silent | Text fallback, optional recorded clips (Phase 2 audio), capability detection |
| Syllabus interpretation gaps | Content mismatch | P0-3 verification, teacher review, syllabus-coverage report |
| Interpreter edge-case bugs | Wrong feedback damages trust | CPython parity corpus, fuzz tests, clear "subset" disclosure in UI |
| Scope creep (more subjects, features) | Delays | Phase gates; Form 2 Programming first; others only after acceptance |
| Content volume (≈ 150+ pages) | Bottleneck | Markdown pipeline, glossary reuse, parallel authoring, templates per page type |
| Translation quality | Confusion | Reviewed flags, teacher sign-off, simple conversational Swahili |
| Licensing (GSAP, fonts) | Legal | Audit in Phase 1; swap libs if needed |
| Handwriting font readability | Accessibility | Dyslexia/readable toggle, larger size options |
| Offline cache bloat/stale content | Broken lessons | Versioned caches, update prompt, size report |

---

## 15. Engineering conventions

- Branch per phase (`phase-2-backpack`, …); small, reviewable commits; each task ends with tests and a short demo clip or screenshot.
- Commit messages: Conventional style (`feat:`, `fix:`, `docs:`), authored by the repo owner only. No co-author trailers and no AI/tool attribution in commits (per your global instruction).
- Definition of done per task: type-checked, linted, unit/e2e tests, budgets respected, accessibility checked, bilingual strings present, docs updated.
- Keep `legacy/` until feature parity is verified, then remove.

---

## 16. Tools and skills to use

Available now: `apple-design` (spring/gesture feel), `high-end-visual-design` and `frontend-design` (visual polish), `webapp-testing` (browser verification), `web-artifacts-builder`, `dataviz` (progress charts), `seo` (landing page and metadata for marketing), plus the browser automation tools for visual checks.
To evaluate before installing (needs your approval for each, with source and licence shown): a physics/animation skill, a Playwright/visual-regression skill, an accessibility-audit skill. Nothing third-party is installed without review.

---

## 17. Open decisions (defaults in bold)

1. Replace or reuse the current four pages: **reuse hardware/peripheral visuals in F1-1.2; drop topology (Form 3 content)**.
2. Backpack rendering: **2.5D canvas/SVG (fast)**; alternative Three.js 3D (richer, heavier).
3. Teaching language: **Python**; alternative C.
4. Loops in Form 2: **include as clearly marked extension unless the printed syllabus lists them in 2.2(f)**.
5. Voice: **Web Speech first, recorded Swahili clips as a funded upgrade**.
6. Hosting: **static (Cloudflare Pages/Netlify/GitHub Pages)**.
7. Project name/branding: **keep "MANOLO"**; confirm tagline and logo for the grant materials.
8. Pilot partners: need at least one Tanzanian CS teacher reviewer — to be identified by you.

---

## 18. First 10 working days (if approved)

| Day | Output |
|-----|--------|
| 1 | Repo restructure, Vite/TS scaffold, CI, syllabus map |
| 2 | Tokens, paper/ink styles ported, font subsets |
| 3 | Router, store, i18n, content schema + validator |
| 4 | Page renderer + pencil margin + sample topic from Markdown |
| 5 | Physics world, springs, drag utilities; perf tiers |
| 6–7 | Bag art + zipper + flap |
| 8 | Notebook spines, selection, cover-open |
| 9 | Contents page + riffle navigation |
| 10 | Review demo: bag → cover → contents → sample page, on desktop and a real phone |

Approve this plan (or mark changes) and I will start at Phase 0.
