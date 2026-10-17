# MANOLO — Realistic Handwritten Notebook Web App
### Digital Studygram & Bilingual NECTA Computer Studies Learning Simulator

> **An interactive 3D web application designed to replicate physical handwritten student notes on ruled paper, featuring a Swahili ↔ English bilingual comprehension bridge, hand-drawn vector circuit simulators, automated NECTA red-pen grading, and zero-video-bandwidth voice lessons.**

---

## 📖 Overview

**MANOLO Handwritten Notebook** is an educational pair-programming and studygram web experience tailored for students transitioning from Swahili-medium primary schools into English-medium secondary schools (Form 1) in Tanzania. 

Students often struggle when shifting from Kiswahili to English instruction, resorting to rote memorization (*kukremu*) without understanding foundational concepts. This project bridges that gap by keeping the official **Tanzania Institute of Education (TIE)** English syllabus intact for exam writing while providing conversational Kiswahili marginalia, everyday local analogies, and live interactive simulators.

---

## 🌟 Key Features

### 1. 🇹🇿 Bilingual "Pencil Margin" (Swahili ↔ English Bridge)
* **Tap-to-Translate Pencil Annotations (`✏️`)**: Tap any underlined technical term across the notebook to reveal a realistic graphite-pencil washi-tape card containing:
  * Official English term + Swahili translation.
  * Everyday Tanzanian analogies:
    * **RAM**: Compared to a *meza ya fundi seremala* (carpenter's workbench) where active work sits; when power is switched off, the workbench is wiped clean (*Volatile Memory*).
    * **Storage (HDD/SSD)**: Compared to a *ghala la kudumu la nafaka* (permanent grain storehouse) that keeps data safe for months regardless of power cuts (*Non-Volatile Memory*).
    * **SMPS**: Compared to a *transfoma ya TANESCO* that steps down dangerous 240V AC wall current to gentle 12V and 5V DC voltages.
    * **Bus Topology**: Compared to a *daladala* on a single tarmac road (*backbone*); if the road is cut at the bridge, the entire route halts (*single point of failure*).
  * Specific **NECTA Exam Keywords** and pronunciation audio (`🔊 Sikiliza`).
* **"Fafanua kwa Kiswahili" Floating Pill Toggle (`[🇹🇿 Fafanua]`)**: Overlays warm canary-yellow sticky notes directly above complex paragraphs on the active page, breaking down technical concepts in conversational Kiswahili without disrupting the underlying English notes.

---

### 2. ⚡ Interactive SVG Diagram Simulator & Active Recall
* **Animated Ink Data Flow (Fetch-Decode-Execute Cycle)**:
  * Clicking the hand-drawn CPU or RAM diagrams (or the `[⚡ Data Flow]` dock button) triggers a real-time machine cycle simulator.
  * Dashed red ballpoint ink paths (`stroke-dasharray`) flow across the components, accompanied by a real-time HUD badge and audio click chimes guiding students through:
    1. **FETCH**: *CPU inachota maelekezo kutoka RAM.*
    2. **DECODE**: *Control Unit (CU) inachambua amri.*
    3. **EXECUTE**: *ALU inafanya hesabu na kutekeleza amri.*
    4. **WRITE-BACK**: *Matokeo yanarudishwa kwenye RAM.*
* **Tap-to-Inspect Motherboard Hotspots**:
  * Four pulsing red-ink bullseyes on the Motherboard diagram:
    * **CPU Socket**: Unfolds a paper cutout card showing the processor chip, gold corner triangle, and thermal paste instructions.
    * **RAM Slots**: Unfolds a card showing DDR4/DDR5 sticks with locking latches.
    * **CMOS Battery**: Unfolds a card explaining the CR2032 3V coin cell that preserves the real-time clock and BIOS settings when unplugged.
    * **PCIe Slots**: Unfolds a card showing dedicated GPU graphics cards and expansion slots.
* **Label-Scramble Mode (`[🧩 Active Recall]`)**:
  * Masks diagram labels (`CPU`, `HDD`, `SSD`, `SMPS`, `MOUSE`, `VDU / LED`, `PRINTER`, `HUB`, `BACKBONE`, `RING`) and displays dashed red-ink dropzones.
  * Spawns a bottom tray of torn-paper slips. Students test their recall by dragging or tapping slips to drop them into the correct component slot, with instant ballpoint checkmarks and score tracking.

---

### 3. 🔴 "Red Pen" NECTA Competency-Based Checkpoint (Page 4)
* **Official NECTA Form 1 Examination Structure**:
  * Formatted with authentic NECTA & TIE assessment styling (*Muda: Dakika 20 • Alama: 15*).
  * **Section A (Objective & Matching - 6 Marks)**:
    * *Question 1*: Real-world scenario MCQ (Juma in Morogoro losing unsaved assignment work during a blackout; tests volatile RAM identification).
    * *Question 2*: Matching Tanzanian everyday analogies to hardware components.
  * **Section B (Short Scenario Questions - 9 Marks)**:
    * *Question 3*: School library network design in Mwanza using low-cost Bus Topology and analyzing single backbone severing risks.
    * *Question 4*: Hardware practical inspection on motherboard CMOS battery purpose.
* **Automated Red-Pen Grading Engine (`[🔴 Sahihisha kwa Kalamu Nyekundu]`)**:
  * Animates realistic red ballpoint pen paths drawing checkmarks (✓) and crosses (✗).
  * Automatically circles key terms and writes handwritten teacher remarks in the red margin with point breakdowns (`+2 Alama`, `+4 Alama`, `+5 Alama`).
  * Stamps a large circled red final score (e.g., `15/15 ★ DARAJA A: NECTA Ready!`) with teacher signature stamp (`Mwalimu Manolo, B.Sc. Ed.`).
  * Reset button (`🔄 Futa / Jaribu Tena`) for repeated practice.

---

### 4. 🎙️ "Mwalimu Voice + Highlighter" (Zero-Video Bandwidth)
* **Paperclipped Voice Notes**:
  * A metallic silver SVG paperclip pinned at the top margin of each page holds a voice lesson player.
  * **0 KB Video Bandwidth**: Uses browser-native Speech Synthesis and Web Audio API synthesized tones, enabling high-quality lessons without consuming student mobile data bundles (*bando*).
  * Tailored bilingual teacher audio for each page.
* **Synced Fluorescent Yellow Highlighter**:
  * A translucent fluorescent yellow marker (`mix-blend-mode: multiply`) glides across text lines and diagrams in real-time sync with Mwalimu's speech timestamps.

---

### 5. 🎨 Physical Paper & Ballpoint Ink Realism
* **3D Page Flip Physics**: Perspective 3D stage (`perspective: 2400px`), rotating page stack, curved left page glimpse, and stacked paper edge depth.
* **Locked 28px Ruled Rhythm**: Text baselines are strictly aligned to 28px horizontal ruled lines with double red vertical margins.
* **Ink Sketch Filters & Micro-Jitter**: SVG fractal displacement filter (`#ink-sketch`) and deterministic per-line rotation/vertical jitter mimic natural human handwriting variance.
* **Multi-Ink Palette Switcher**: Toggle between *Bic Blue* (`#1b387b`), *Gel Black* (`#23272e`), and *Indigo Fountain* (`#2e1f6e`).
* **Live Note Editing**: Switch into *Edit Mode* to type directly onto the ruled notebook lines.

---

## 📚 Curriculum Notes Included

1. **Page 1: Computer Basics (Part - 3)** — Internal Hardware Components:
   * CPU, Motherboard, RAM, Storage (HDD & SSD), SMPS Power Supply.
2. **Page 2: Computer Basics (Part - 4)** — Peripheral Devices:
   * Keyboard (QWERTY), Optical Mouse, Monitor (VDU), Printer (Laser/Inkjet), Scanner & Speakers.
3. **Page 3: Computer Networks (Part - 1)** — Network Topologies:
   * Star Topology, Bus Topology, Ring Topology, Mesh Topology.
4. **Page 4: NECTA Competency Checkpoint (Form 1)** — Competency-Based Assessment:
   * Real-world scenario problem solving, matching items, and automated red-pen grading.

---

## 🚀 Getting Started

No compilation, node modules, or backend server required.

1. Clone or download this repository.
2. Double-click or open `handwritten_notebook_web_app.html` in any modern web browser (Google Chrome, Safari, Firefox, Microsoft Edge, or mobile browsers).
3. Interact using mouse clicks, arrow keys (`←` / `→`), or touch swipes.

---

## 🛠️ Tech Stack

* **Markup & Structure**: HTML5, SVG Vectors & Filters (`feTurbulence`, `feDisplacementMap`).
* **Styling**: Tailwind CSS CDN, Custom 3D CSS Transforms (`transform-style: preserve-3d`).
* **Typography**: Google Fonts (*Patrick Hand*, *Kalam*, *Caveat*, *Permanent Marker*, *Inter*).
* **Audio Engine**: Web Speech Synthesis API & Web Audio API (Oscillator synthesis).
* **Scripting**: Pure Vanilla JavaScript (Zero external libraries or npm dependencies).

---

## 👨‍🏫 Author & Credits

* **Developer & Designer**: Festo Manolo ([festomanolo.com](https://festomanolo.com))
* **Curriculum Alignment**: Tanzania Institute of Education (TIE) & National Examinations Council of Tanzania (NECTA) Form 1 Computer Studies Syllabus.

---

## Study app (v1 slice)

`npm run serve` then open http://localhost:8080. `npm test` runs interpreter tests; `npm run validate` checks content. The original app is in `legacy/`.
