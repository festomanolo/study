# Syllabus map
Source: TIE Computer Science Syllabus I–IV (2023). See `docs/IMPLEMENTATION_PLAN.md` §2 for units and periods.
Open check (P0-3): verify 2.2(a) and loop/iteration wording against the printed PDF. Loops are currently marked as extension.
Coverage: run `node -e "import('./content.js').then(m=>{for(const f of Object.values(m.forms))for(const u of f.units)for(const t of u.topics)console.log(u.id,t.code,t.title)})"`.

## Form 2 programming coverage (F2-2.2)
Expanded from the Form 2 Student's Book, programming chapter (OCR extract, pp. 104-158). Notes live in `notes-f2.js`.
| Student's Book section | Topic id | Syllabus code |
|---|---|---|
| Importance of programming, role of languages | `why-prog` | F2-2.2(a) |
| From hardware to code, how a program works | `how-prog-runs` | F2-2.2(a) |
| Overview, low-level vs high-level languages | `lang` | F2-2.2(a) |
| Generations, paradigms, popular languages | `generations` | F2-2.2(a) |
| Source/object code, translators, compilers | `tools` | F2-2.2(b) |
| IDEs, online/offline editors, libraries | `envs` | F2-2.2(b) |
| Installing and configuring (Python and C) | `setup` | F2-2.2(c) |
| First program (Python and C) | `first` | F2-2.2(d) |
| Algorithms, pseudocode, flowcharts | `prog-algo` | F2-2.2(d) |
| Data types and data structures | `dtypes` | F2-2.2(e) |
| Variables, operators, expressions | `vars` | F2-2.2(e) |
| Control flow: sequence, selection, iteration | `branch` | F2-2.2(f) |
| Problem-solving skills, game planning | `decompose` | F2-2.2(f) |
| Program Development Life Cycle | `pdlc` | F2-2.2(d-g) |
| Scratch and micro:bit activities | `scratch` | F2-2.2(d) |
| Good coding habits | `habits` | F2-2.2(g) |
| Debugging, exceptions, error handling | `debug` | F2-2.2(g) |
| Mini project | `project` | F2-2.2(d-g) |
| Careers and the future of coding | `careers` | F2-2.2(a) |

Notes on the source: the OCR text is noisy in places (tables 3.2-3.6 and some exercises). Where it was garbled, the note follows standard definitions and the surrounding text. The book teaches iteration (for/while) as one of three control structures, so loops are now core content; the printed syllabus wording for 2.2(f) is still to be checked (P0-3). Book figures were not used.
