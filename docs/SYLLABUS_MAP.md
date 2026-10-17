# Syllabus map
Source: TIE Computer Science Syllabus I–IV (2023). See `docs/IMPLEMENTATION_PLAN.md` §2 for units and periods.
Open check (P0-3): verify 2.2(a) and loop/iteration wording against the printed PDF. Loops are currently marked as extension.
Coverage: run `node -e "import('./study/content.js').then(m=>{for(const f of Object.values(m.forms))for(const u of f.units)for(const t of u.topics)console.log(u.id,t.code,t.title)})"`.
