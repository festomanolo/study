# MANOLO Backpack — EdTech Reality Check, Micro-Features & Project Gaps

> **Status**: Active Roadmap, Micro-Feature Specification & Codebase Audit (`gaps.md`)
> **Target**: Form 1 & Form 2 Computer Science (TIE 2023 Ordinary Secondary Syllabus)

This document covers:
1. **What Most Tanzanian EdTechs Build (Presumed Correct, Not Demanded)** vs. what learners, teachers, and parents actually need.
2. **16 High-Impact Micro-Features (Real-Book UI/UX & Local Realities)** with concrete implementation blueprints for MANOLO Backpack.
3. **Current Codebase, Testing, PWA & Curriculum Gaps** identified from scanning `/Volumes/MacX/projects/study`.
4. **Concept-Capture & Adaptive Understanding Engine (`understand.js`)** — how to evaluate *how* a learner captures concepts and dynamically inject tailored explanations, analogies, and micro-drills offline.

---

## Part 1: What Most Tanzanian EdTechs Build (Presumed Correct, Not Demanded)

Most EdTech platforms in Tanzania copy Silicon Valley or Western consumer EdTech playbooks. Founders and grant writers *presume* these features are the right solution, but in real Tanzanian secondary schools (Form 1–4) and homes, they are rarely demanded or retained:

| What EdTechs Build (Presumed Correct) | Why It Fails in Real Tanzanian Schools & Homes | What Is Actually Demanded Instead |
|---|---|---|
| **1. Heavy Video Lectures ("YouTube-style Mwalimu")** | Eats 100–300 MB per lesson (*bando* anxiety). Students on a TZS 500–1,000 daily bundle cannot stream video, and pausing/rewinding a 20-minute video to copy notes into a physical *daftari* is painful. | **Structured, ruled *Daftari* notes + 0-KB voice/highlighter walk-throughs** that match classroom board notes and can be copied directly into a real Counter Book. |
| **2. Open-Ended AI Chatbots ("Ask AI Mwalimu Anything")** | Form 1–2 students transitioning from Kiswahili primary school do not know *what prompt to type in English*. Worse, LLMs give verbose, university-level answers that do **not** match **NECTA marking schemes**, costing students marks. | **Inline tap-to-reveal Kiswahili pencil marginalia** right on the hard English word + **1-line NECTA exam definitions** that earn full marks. |
| **3. Individual Accounts, Email/OTP Logins & Parent Portals** | Most Form 1–2 day students do not own a personal smartphone or email—they borrow a parent's, older sibling's, or neighbour's phone for 30 minutes at night, or 3–4 friends crowd around one screen. | **Zero-login instant start + a 1-tap "Who's Studying?" name switcher** right on the notebook cover sticker (`Asha` ↔ `Juma` ↔ `Neema`). |
| **4. Western Gamification (Daily Streaks, Gems, Leaderboards)** | A student who only gets their mother's phone on Tuesday and Saturday loses their "daily streak" immediately—feeling punished for not owning a personal device. | **Permanent "Red-Pen" teacher ticks, rubber stamps (`HONGERA`), and *Yaliyomo* completion ticks** that never expire when you miss a day. |
| **5. Desktop-Style Code Sandboxes** | Typing Python symbols (`:`, `_`, `( )`, `" "`, `=`, 4-space indent) on a cheap Android touchscreen keyboard is maddening—auto-correct capitalizes `Print` into a `NameError` and inserts curly smart-quotes (`“ ”`) that break syntax. | **A thumb-friendly mobile token bar + keyboard auto-healer** that silently fixes smart quotes and offers a 1-tap fix when mobile auto-caps turns `print` into `Print`. |
| **6. Generic Multiple-Choice Quizzes Only** | NECTA exams do **not** only test MCQs. Students fail Section B & C because they don't know which keywords carry the 2 marks in a definition, how to fill a trace table, or how to draw a valid flowchart. | **Red-Pen Rubric X-Ray ("Where each mark comes from")** that highlights the exact phrases a NECTA marker looks for. |
| **7. Cloud-Synced Teacher Dashboards Requiring School Wi-Fi** | Most school computer labs have intermittent or zero internet, and teachers mark 60–100 physical notebooks per stream by hand. | **Offline "Pass-Around" Inspection Mode & 1-tap CSV/WhatsApp summary** so a teacher can check progress on the device in 5 seconds during class. |

---

## Part 2: 16 Micro-Features to Bridge the Gap (Prioritized Bundles)

These small, zero-bloat micro-interactions build on the tactile notebook metaphor in `app.js` and `style.css` so that any Tanzanian student or teacher immediately feels *"Hii ni daftari letu halisi"* ("This is our real exercise book"):

### Bundle 1: Tactile *Counter Book / Quire Book* UI/UX Micro-Details

1. **Authentic Tanzanian 2-Quire Counter Book Cover & White Pasted Label (`cover()` in `app.js`)**:
   - **Why**: Every secondary student in Tanzania recognizes the hardbound black-and-red or blue-and-black marbled **Counter Book (2 Quire / 3 Quire)** with a red cloth spine and a white rectangular ruled sticker on the front.
   - **Micro-UX**: Upgrade `.cover .lid` in `style.css` with a cloth spine strip on the left hinge and a white paper label box containing `JINA / NAME:`, `SOMO / SUBJECT: Computer Science`, `KIDATO / FORM:`, and `SHULE / SCHOOL:`.
2. **Top-Right `DATE: __/__/2026` & `PAGE NO.` Header Box (`renderPage()` in `app.js`)**:
   - **Why**: Real Tanzanian ruled exercise books have a small printed `Date: ___` and `Page: ___` box in the top-right header margin above the double red line.
   - **Micro-UX**: Stamp the date (`S.dates[pg.id]`) in ballpoint handwriting the first time a student studies that page, and show the page number (`uk. 4`) inside the box.
3. **Folded Page Corner / *Dog-Ear Bookmark* (`pageScene()` in `app.js`)**:
   - **Why**: Students fold the top-right corner of their *daftari* page when a topic is tricky or needs revision before a test.
   - **Micro-UX**: Tapping the top-right corner of `.sheet` toggles `S.dogear[pg.id]`, folding a CSS 3D paper triangle (`border-width` / `linear-gradient` crease) with a crisp paper sound (`chime(420, 0.04)`) and listing dog-eared pages at the top of *Yaliyomo* (`toc()`).
4. **Ruler-Drawn Double Underlines on Section Headings (`h3.ink-head` in `style.css`)**:
   - **Why**: In Tanzanian schools, teachers deduct neatness marks if headings are not double-underlined with a ruler.
   - **Micro-UX**: Style `.spread .sheet h3.ink-head` with a double ballpoint/red-pen underline (`border-bottom: 3px double var(--margin-red)`) that animates left-to-right when the page opens.
5. **Left-Margin Teacher Inspection Stamp — *Ukaguzi wa Daftari* (`renderPage()` in `app.js`)**:
   - **Why**: Weekly notebook inspection (*ukaguzi wa madaftari*) where the teacher signs and dates the margin in red pen is a core school ritual.
   - **Micro-UX**: Once `topicDone(t)` is true (Lab + Quiz >= 60%), render a rotated red-pen margin signature (`Seen • Mwl. Manolo`) in the left red margin of that topic's pages.
6. **"Copy to Physical Daftari" Mode — `[Nakili Daftarini]` (`pageScene()` in `app.js`)**:
   - **Why**: Students still need notes written in their physical Counter Book for class inspection.
   - **Micro-UX**: A pill button that numbers every ruled line (`1, 2, 3…`), displays an estimate (`approx. 1.2 Counter Book pages`), hides floating popups, and requests `navigator.wakeLock?.request('screen')` so the phone screen doesn't turn off while the student copies notes by hand.

### Bundle 2: Mobile Python Keyboard Auto-Healer & Dry-Run Scratchpad

7. **Android Auto-Caps & Smart-Quote Auto-Healer (`lex()` in `interp.js` & `consoleLab()` in `app.js`)**:
   - **Why**: Cheap Android keyboards automatically capitalize the first letter of every new line (`Print("Jambo")`, `If marks >= 50:`, `For i in range(3):`) and insert curly quotes (`“ ”`, `‘ ’`). Beginners get `NameError: "Print" is not a function` or `SyntaxError` and think coding is impossible.
   - **Micro-UX**:
     - Silently normalize curly quotes (`“ ” ‘ ’` → `" '`) and non-breaking spaces in `interp.js` or before running.
     - If a line starts with a capitalized Python keyword/builtin (`Print`, `Input`, `If`, `Elif`, `Else`, `For`, `While`, `Range`, `Int`, `Float`, `Str`, `Len`), show a 1-tap yellow chip above the console: `Simu imeweka herufi kubwa "Print". Rekebisha iwe "print"? [Fix Auto-Caps]`.
8. **Torn-Paper "Dry-Run / Trace Table" Scratchpad (`consoleLab()` in `app.js`)**:
   - **Why**: NECTA Form 2 & Form 4 programming questions heavily test **manual trace tables** (tracking variable values line by line on paper without a computer).
   - **Micro-UX**: Add a `[Kikaratasi cha Trace]` toggle inside `consoleLab` that opens a 3-column ruled paper slip (`Step | Variable Values | Printed Output`) where students type their prediction before pressing `Run`, then compares their prediction with the actual `vars` and `out` from `interp.js`.
9. **1-Tap Mobile Token Bar Expansion (`keys` in `consoleLab()`, `app.js` line 301)**:
   - **Why**: Beyond `: ( ) " = [ ] Tab`, students struggle to find `_`, `>=`, `<=`, `!=`, `==`, `#`, and `+` on phone keyboards.
   - **Micro-UX**: Add `==`, `>=`, `!=`, `_`, `#`, `print()`, and `input()` as scrollable 1-tap ink chips above the code textarea.

### Bundle 3: Shared-Phone 1-Tap Name Switcher & *Bando*-Trust Micro-Features

10. **Cover Label 1-Tap "Who's Studying?" Profile Switcher (`cover()` in `app.js` line 117)**:
    - **Why**: When 3 siblings or classmates share one phone, overwriting `S.lab` and `S.quiz` ruins everyone's progress ticks.
    - **Micro-UX**: On the notebook cover right below `Name:`, show small clickable name pills (`[+ Add Learner]` / `[Asha]` / `[Juma]`). Switching learners swaps the active profile slot in `localStorage` (`manolo.v1.<profile>`) in 1 tap with zero passwords or internet.
11. **"0 MB Bando Used" Offline Shield Badge (`bag()` in `app.js` line 85)**:
    - **Why**: Parents hesitate to hand over their phone if they think an app is secretly consuming their mobile data bundle (*bando*).
    - **Micro-UX**: Show a persistent green badge on the backpack (`Offline Ready • 0 MB Bando Used / Inafanya kazi bila bando`) that confirms when the Service Worker cache is active.
12. **"30-Second Group Turn" Pass-the-Phone Quiz Mode (`quiz()` in `app.js`)**:
    - **Why**: Students often revise in small groups of 2–4 around a single phone under a tree or in a classroom.
    - **Micro-UX**: In practice quizzes, show a subtle `Swali la 1 (Mwanafunzi A) -> Swali la 2 (Mwanafunzi B)` prompt so friends naturally take turns answering one question each before pressing `Check / Kagua`.

### Bundle 4: Language-Bridge & Exam-Craft Micro-Features

13. **Phonetic "Read-Aloud Confidence" Syllable Guide (`content.js` & `renderPage()` in `app.js`)**:
    - **Why**: Students coming from Kiswahili primary school know how to read phonetic syllables, but English silent letters (*algorithm*, *pseudocode*, *volatile*, *phishing*, *hierarchy*) make them afraid to speak up in class.
    - **Micro-UX**: Display a phonetic pronunciation bracket `[AL-go-ri-thim]`, `[SU-do-kod]`, `[FI-shing]` inside the pencil margin popup alongside a single-word `Tamka` button.
14. **Red-Margin "NECTA Trap Alerts" — *Makosa Yanayopoteza Alama* (`content.js` / `notes.js`)**:
    - **Why**: Students lose easy marks on predictable conceptual traps.
    - **Micro-UX**: Render a hand-drawn red-ink warning box (`Mtego wa Mtihani / Exam Trap`) on topics with notorious confusions:
      - `hardware`: **RAM** (clears when power cuts — *volatile*) vs. **Hard Disk/SSD** (keeps files when power cuts — *non-volatile*).
      - `internet`: **Internet** (global network of cables/routers) vs. **WWW** (collection of web pages on the internet).
      - `vars`: **`x = 5`** (stores 5 in box `x`) vs. **`x == 5`** (asks whether `x` equals 5).
      - `debug`: **Syntax Error** (stopped before running) vs. **Logic Error** (runs fine, wrong answer like `+` instead of `*`).
15. **"Where the 2 Marks Live" NECTA Keyword Underliner (`renderPage()` on `summary` & `glossary` pages)**:
    - **Why**: NECTA marking schemes split a 2-mark definition into two 1-mark key phrases. Students who write a vague paragraph get `0/2`.
    - **Micro-UX**: Add a `[Alama za NECTA]` toggle on `glossary` and `summary` pages that underlines the key scoring verbs/nouns in red pen and shows `(1 mark + 1 mark = 2 marks)`.
16. **Long-Press / Tap Sentence "Fafanua Mstari Huu" Whisper Strip (`renderPage()` in `app.js`)**:
    - **Why**: Sometimes a student understands the technical term (`[[algorithm]]`) but gets stuck on an English sentence structure in the notes.
    - **Micro-UX**: When `Fafanua` is active, tapping any paragraph or callout shows a compact canary-yellow sticky note strip explaining the core takeaway in plain conversational Kiswahili.

---

## Part 3: Current Repository & Implementation Gaps (From Codebase Audit)

### 1. Codebase Bugs & Regressions
- **Broken E2E Test — [tests/e2e/labs.mjs](file:///Volumes/MacX/projects/study/tests/e2e/labs.mjs#L1-L19)**:
  - **Line 18**: References an undeclared variable `errs` (`console.log('files', await lab(), errs);`), throwing `ReferenceError: errs is not defined`.
  - **Line 3**: `idx` hardcodes `n += 7 + (t.lab2 ? 1 : 0)` and `off = 4`. Because `pagesOf()` in [app.js](file:///Volumes/MacX/projects/study/app.js#L44-L51) dynamically splits long notes from [notes.js](file:///Volumes/MacX/projects/study/notes.js) into 2–3 pages (`notes`, `notes1`, `notes2`) and no longer emits a standalone `'hook'` page, the hardcoded page index lands on the wrong page.
- **Broken E2E Test — [tests/e2e/flow.mjs](file:///Volumes/MacX/projects/study/tests/e2e/flow.mjs#L10-L11)**:
  - **Line 10**: Clicks `Variables, data types` in the TOC and presses `Next page` only once before waiting for `textarea`. Because `vars` has multiple note pages + `glossary` before `lab`, clicking `Next page` once lands on `notes1` instead of `lab`, timing out on `waitForSelector('textarea')`.
- **Incomplete Bundle Budget Check — [scripts/size-report.mjs](file:///Volumes/MacX/projects/study/scripts/size-report.mjs#L1-L3)**:
  - Checks `['index.html', 'style.css', 'app.js', 'interp.js', 'content.js', 'labs.js', 'sw.js']` (36.9 KB gz), omitting [notes.js](file:///Volumes/MacX/projects/study/notes.js), [diagrams.js](file:///Volumes/MacX/projects/study/diagrams.js), and [notebook.js](file:///Volumes/MacX/projects/study/notebook.js).
- **Dead Code in [app.js](file:///Volumes/MacX/projects/study/app.js#L218-L219)**:
  - `renderPage()` still has an `else if (type === 'hook')` branch even though `'hook'` is rendered inline at the top of `notes` (line 210) and is no longer in `pagesOf()`.
- **Outdated Path References in Documentation**:
  - [docs/SYLLABUS_MAP.md](file:///Volumes/MacX/projects/study/docs/SYLLABUS_MAP.md#L4) and [docs/CONTENT_GUIDE.md](file:///Volumes/MacX/projects/study/docs/CONTENT_GUIDE.md#L2-L6) reference `./study/content.js` and `study/interp.js` instead of `./content.js` and `./interp.js`.
  - [README.md](file:///Volumes/MacX/projects/study/README.md#L105) still points users to `handwritten_notebook_web_app.html` in the root rather than `index.html`.

### 2. Offline PWA & Repository Hygiene Gaps
- **Missing `.gitignore`**:
  - Root directory has no `.gitignore` to exclude `node_modules/`, `.gravitas/`, `.DS_Store`, and Playwright test artifacts.
- **Google Fonts Network Dependency**:
  - [index.html](file:///Volumes/MacX/projects/study/index.html#L3) loads `Kalam`, `Patrick Hand`, and `Caveat` from `https://fonts.googleapis.com` rather than local subset `.woff2` files cached in [sw.js](file:///Volumes/MacX/projects/study/sw.js).
- **Legacy Hardware App in `<iframe>`**:
  - `hardware()` in [app.js](file:///Volumes/MacX/projects/study/app.js#L110-L112) embeds [legacy/handwritten_notebook_web_app.html](file:///Volumes/MacX/projects/study/legacy/handwritten_notebook_web_app.html) inside an `<iframe>`, which still pulls Tailwind CDN over the network.
- **Missing GitHub Actions CI**:
  - No `.github/workflows/ci.yml` exists yet to run `npm test`, `npm run validate`, and `npm run size` on push.

### 3. Curriculum & Interactive Lab Gaps vs. [docs/IMPLEMENTATION_PLAN.md](file:///Volumes/MacX/projects/study/docs/IMPLEMENTATION_PLAN.md)
- **Unit Checkpoints (`codeQs` & Short-Answer Rubrics)**:
  - Only `F2-2.2` has auto-tested code questions in [`codeQs`](file:///Volumes/MacX/projects/study/content.js#L144-L147). Units `F1-1.1`, `F1-1.2`, `F1-1.3`, `F1-2.1`, and `F2-1.5` only replay topic MCQs and lack scenario/short-answer rubric questions.
- **Swahili Glossary Coverage & Teacher Review**:
  - All 83 strings in [docs/SWAHILI_REVIEW.csv](file:///Volumes/MacX/projects/study/docs/SWAHILI_REVIEW.csv) are marked `"no"` under `reviewed`.
  - `EXTRA` in [notes.js](file:///Volumes/MacX/projects/study/notes.js#L304) is empty (`{}`), so many terms introduced in the full lesson notes are not yet linked with `[[term]]` marginalia.
- **Remaining Planned Bespoke Labs**:
  - Built bespoke labs in [labs.js](file:///Volumes/MacX/projects/study/labs.js) (4): `boda`, `conveyor`, `packets`, `files`.
  - Planned bespoke labs still using generic template widgets (`sort`, `order`, `ladder`, `hot`, `flow`, `pwd`, `console`):
    - `F2-2.2`: Data Type Sorting (Lab I), Operator Workshop (Lab J), Constants Padlock (Lab K), Fork in the Road Marble Switch (Lab L), Indentation as Rooms (Lab M), Loop Conveyor (Lab N), 3-Level Bug Hunt (Lab O), Trace Table Builder (Lab P).
    - `F2-1.5`: Search Smarter query game, Email Anatomy pretend inbox.
    - `F1-1.2`: Build-a-PC slot builder, Computer Generations timeline, Software Layer Cake, Backup 3-2-1 disaster simulator.
    - `F1-2.1`: Interactive canvas Flowchart Builder & token runner.

---

## Status (implemented)

- **Part 2:** all 16 micro-features are in the app (`app.js`, `style.css`, `micro.js`, `interp.js`). The grade bands in Lab L follow common NECTA practice and should be checked against the current scheme.
- **Part 3.1:** e2e tests rewritten to look up pages through `window.__manolo.pagesOf`; size report covers every root file and reports fonts; dead `hook` branch removed; doc paths and README fixed. Also fixed: code-lab Run/Step buttons were hidden by an old `.nav{display:none}` rule.
- **Part 3.2:** `.gitignore` added; fonts self-hosted in `fonts/` (OFL); the legacy notebook uses a precompiled `legacy/tailwind.css` and local fonts, so nothing loads from the network. CI already existed.
- **Part 3.3:** every unit checkpoint now has short-answer questions marked by an EN+SW keyword rubric (`micro.js` `SHORT`); all 15 listed bespoke labs are built in `labs.js` and covered by `tests/e2e/labs.mjs`.
- **Still open:** teacher review of all Swahili (`docs/SWAHILI_REVIEW.csv` and `micro.js`), extra `[[term]]` links in `notes.js` (`EXTRA`), fonts are 195 KB against the 120 KB budget (subsetting needed), the whisper strip shows a topic-level Kiswahili takeaway plus term translations rather than a per-sentence translation.

---

## Part 4: Concept-Capture & Adaptive Understanding Engine (`understand.js`)

### 1. Why This Is Achievable (Without Cloud LLMs or Bando)

Most EdTech apps evaluate learners with a blunt percentage (`Score: 1/3 — Revise the notes and try again`). Re-reading the exact same paragraph that failed to click the first time rarely fixes the confusion. Conversely, cloud LLM tutors cost money per token, require mobile data (*bando*), and often give explanations that drift from the TIE syllabus and NECTA marking schemes.

In Form 1 & Form 2 Computer Science, **how a student misunderstands a concept is finite, observable, and deterministic**. Because MANOLO Backpack already owns the Python interpreter (`interp.js`), the trace-table scratchpad (`consoleLab`), the interactive diagrams (`notebook.js`), and the bilingual rubric (`micro.js`), we can build a **zero-bandwidth Concept-Capture & Adaptive Understanding Engine (`understand.js`, ~4 KB gz)** that:
1. **Reads how a kid understands** by capturing 5 live diagnostic signals as they interact with notes, diagrams, code, and questions.
2. **Evaluates which specific sub-concept or mental model failed** (not just "wrong answer", but *why* they chose that answer or wrote that bug).
3. **Dynamically injects tailored remedial content** directly onto the ruled notebook page (alternate local analogies, decomposed step-by-step trace cards, visual contrast boxes, and 15-second "Prove You Captured It" micro-checks) until the concept clicks.

---

### 2. The 5 Diagnostic Signals (How the Engine Reads the Learner's Mind)

| Signal Source | What the Engine Observes | Example Misconception Diagnosed |
|---|---|---|
| **1. Diagnostic Distractor Tagging (`quiz` & `checkpoint`)** | Every wrong MCQ option maps to a specific `misconceptionId` instead of a generic `false`. | Picking `SSD` as volatile memory -> `M_VOLATILE_FLIP` (confusing temporary workbench with permanent storehouse). Picking `"5" + 5 -> 10` -> `M_STR_NUM_COERCE` (ignoring quotation marks around digits). |
| **2. Python AST & Error Telemetry (`interp.js`)** | Inspects the learner's code edits, error types (`SyntaxError`, `NameError`, `TypeError`, `IndentationError`, `LoopError`), and AST patterns across runs. | Writing `if marks = 50:` -> `M_ASSIGN_VS_EQ`. Repeated `IndentationError` -> `M_BLOCK_SCOPE`. Infinite `while` loop -> `M_LOOP_STATE_UPDATE`. |
| **3. Trace-Table Prediction Delta (`tracepad` in `app.js`)** | Compares the learner's manual dry-run prediction (`Step | Variables | Output`) against the actual generator events from `run()`. | Writing `age=15` on step 3 after `age = age + 1` -> `M_VAR_IMMUTABLE` (believing a variable keeps its first value or stores both values at once). |
| **4. Lab Bounce & Active-Recall Hesitation (`labs.js` & `notebook.js`)** | Tracks which tiles bounce off which sockets (`wrong` / `bad` class) and which diagram labels take multiple attempts. | Bouncing `Antivirus` onto `Application software` -> `M_UTIL_VS_APP` (not distinguishing system utilities from user applications). |
| **5. Missing-Mark Rubric Half-Hits (`markShort` in `micro.js`)** | Checks *which* of the two 1-mark keyword groups was missed in a 2-mark NECTA definition. | Earning Mark 1 (`"temporary memory"`) for RAM but missing Mark 2 (`"lost when power goes off"`) -> `M_HALF_DEF_RAM`. |

---

### 3. Per-Learner Concept State Model (`S.understand`)

Stored per learner profile inside `localStorage` (`manolo.v1.<profile>`), requiring **0 bytes of network traffic**:

```js
// S.understand[conceptId]
{
  mastery: 0.35,              // 0.0 (unseen/struggling) -> 1.0 (solidly captured)
  attempts: 4,                // total diagnostic interactions on this concept
  streak: 0,                  // consecutive first-try captures
  misconceptions: {           // frequency of specific mental-model bugs
    M_STR_NUM_COERCE: 2,
    M_ASSIGN_VS_EQ: 1
  },
  preferredBridge: 'analogy', // 'analogy' | 'visual-contrast' | 'swahili-step' | 'trace'
