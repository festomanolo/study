// Understanding engine: Bayesian Knowledge Tracing per topic + a misconception library.
// Evidence: quiz answers, code errors, finished labs. Output: mastery per topic, active misconceptions,
// help cards with a re-explanation and a check question, and a review queue of missed questions.
// Swahili pending teacher review. Parameters are first guesses until tuned with pilot data.
const G = .25, SL = .1, TR = .12; // guess, slip, learn-per-step

// tag: [topic, title, explanation, Kiswahili, analogy, example code or '', check question [q, opts, ans]]
export const MIS = {
  'int-division': ['vars', '// keeps only the whole part', '`7 // 2` divides and throws away the remainder, so it gives 3. Use `/` for the exact answer 3.5, and `%` for the remainder 1.', '`//` hugawanya na kubaki na sehemu kamili tu.', 'Sharing 7 mandazi between 2 friends: each gets 3, one is left over.', 'print(7 // 2)\nprint(7 / 2)\nprint(7 % 2)', ['What is 9 // 4?', ['2', '2.25', '1'], 0]],
  'str-int-concat': ['vars', 'Text and numbers do not add', '`"5"` has quotes, so it is text (str). `5` is a number (int). Python will not add them: convert first with `int("5") + 5`.', 'Maandishi na namba haviwezi kujumlishwa moja kwa moja; badilisha kwanza.', 'You cannot add a written word "tano" to the number 5 on a calculator.', 'print(int("5") + 5)\nprint("5" + str(5))', ['What does int("4") + 1 give?', ['5', '41', 'TypeError'], 0]],
  'identifier-rules': ['vars', 'Rules for variable names', 'A name may use letters, digits and _, but cannot start with a digit and cannot contain - or spaces. `total_price` is fine; `2cats` and `my-var` are not.', 'Jina la kibadilishi lisianze na namba wala lisiwe na - au nafasi.', 'Like a locker label: one word, no spaces.', '', ['Which name is valid?', ['marks_2', '2marks', 'my marks'], 0]],
  'name-before-assign': ['vars', 'Give a variable a value before using it', 'A NameError means you used a name Python has never seen. Assign it first (`age = 15`) and check the spelling.', 'Kibadilishi lazima kipewe thamani kabla ya kutumika.', 'You cannot open a locker that has not been given a name yet.', 'age = 15\nprint(age)', ['Which line must come first?', ['score = 10', 'print(score)', 'Either order works'], 0]],
  'range-start': ['branch', 'range() starts at 0 and stops before n', '`range(3)` gives 0, 1, 2: three numbers, starting at 0, never reaching 3.', 'range(3) huanza 0 na huishia kabla ya 3.', 'Like counting floors where the ground floor is 0.', 'for i in range(3):\n    print(i)', ['What is the last number in range(5)?', ['4', '5', '6'], 0]],
  indent: ['branch', 'Indentation decides what belongs inside', 'Lines inside `if`, `for` or `while` must be indented 4 spaces. Lines that are not indented are outside and always run.', 'Mistari ya ndani lazima iingizwe nafasi 4.', 'Rooms in a house: indented lines live inside the if-room.', 'marks = 30\nif marks >= 50:\n    print("Pass")\nprint("Done")', ['In the example, what prints when marks = 30?', ['Done', 'Pass and Done', 'Nothing'], 0]],
  'missing-colon': ['branch', 'if, for and while end with a colon', 'A line that opens a block (`if`, `elif`, `else`, `for`, `while`) must end with `:`.', 'Mstari wa if/for/while huishia na nukta mbili (:).', 'The colon is the door into the room.', 'x = 3\nif x > 2:\n    print("big")', ['Which line is correct?', ['if x > 2:', 'if x > 2', 'if: x > 2'], 0]],
  'infinite-loop': ['branch', 'A while loop needs a way to stop', 'If nothing inside the loop changes the condition, it runs forever. Update the counter (`count += 1`).', 'Kitanzi kisichobadilisha sharti hakiishi kamwe.', 'A conveyor belt with no off switch.', 'count = 0\nwhile count < 3:\n    print(count)\n    count += 1', ['What stops `while n < 5:`?', ['Changing n inside the loop', 'Printing n', 'Nothing'], 0]],
  'control-structures': ['algorithms', 'Sequence, selection, iteration', 'Sequence = steps in order. Selection = choosing a path (if). Iteration = repeating steps (loops).', 'Mfuatano, uteuzi (if) na marudio (loop).', 'Making chai: steps in order, choose sugar or not, stir again and again.', '', ['"Stir until the sugar dissolves" is…', ['Iteration', 'Selection', 'Sequence'], 0]],
  'error-types': ['debug', 'Syntax, runtime and logic errors', 'Syntax error: breaks the language rules, nothing runs. Runtime error: crashes while running (e.g. NameError). Logic error: runs, but the answer is wrong.', 'Sintaksia: haianzi. Wakati wa kuendesha: inaanguka. Mantiki: jibu baya.', 'Grammar mistake vs. falling off the bike vs. riding to the wrong village.', '', ['print(2 + 2 * 0) should show 0 but shows 2. This is a…', ['Logic error', 'Syntax error', 'Runtime error'], 0]],
  'ram-volatile': ['hardware', 'RAM forgets when power goes', 'RAM is volatile: data is lost when the power is cut. Hard disks and SSDs are non-volatile: they keep files.', 'RAM husahau umeme ukikatika; diski hukumbuka.', 'Chalk on the board (RAM) vs. your exercise book (disk).', '', ['After a power cut, which still has your file?', ['SSD', 'RAM', 'Both lose it'], 0]],
  'internet-www': ['internet', 'Internet is not the WWW', 'The Internet is the network (cables, routers). The WWW is the web pages that travel over it. Email is another internet service.', 'Intaneti ni barabara; WWW ni magari (kurasa) yanayopita juu yake.', 'Roads vs. the buses that use them.', '', ['WhatsApp messages travel over…', ['The Internet', 'The WWW only', 'RAM'], 0]],
  'compile-interpret': ['tools', 'Compiler vs interpreter', 'A compiler translates the whole program first; an interpreter translates and runs one line at a time. Python is usually interpreted.', 'Kikusanyaji: yote kwanza. Mkalimani: mstari mmoja mmoja.', 'Translating a whole book vs. an interpreter at a meeting.', '', ['Which stops at the first bad line while running?', ['Interpreter', 'Compiler', 'Both never stop'], 0]],
  'flow-shapes': ['flowcharts', 'Flowchart shapes', 'Oval = Start/End. Parallelogram = Input/Output. Rectangle = Process. Diamond = Decision (Yes/No).', 'Duaradufu, msambamba, mstatili, almasi.', 'Road signs: each shape has one meaning.', '', ['"Is marks >= 50?" goes in a…', ['Diamond', 'Oval', 'Rectangle'], 0]],
  'binary': ['lang', 'Computers understand only binary', 'The CPU only understands 0s and 1s (machine code). Python must be translated before the computer can run it.', 'Kompyuta inaelewa 0 na 1 tu.', 'A light switch: only ON or OFF.', '', ['Which can the CPU run directly?', ['Machine code', 'Python', 'English'], 0]],
  'phishing-flags': ['threats', 'Spotting a scam message', 'Red flags: urgency, prizes, strange links, and any request for your PIN or password. Real services never ask for your PIN.', 'Haraka, zawadi, viungo vya ajabu, na kuomba PIN ni dalili za ulaghai.', 'A stranger at the gate asking for your house key.', '', ['"Send your PIN now to receive TZS 50,000" is…', ['A scam', 'Safe', 'From your bank'], 0]],
};
// question → misconception tag ('topic:index'); unmapped wrong answers fall back to the topic itself.
const QTAG = { 'vars:1': 'int-division', 'vars:2': 'str-int-concat', 'vars:3': 'identifier-rules', 'branch:1': 'range-start', 'branch:2': 'indent', 'algorithms:1': 'control-structures', 'algorithms:2': 'control-structures', 'branch:0': 'control-structures', 'debug:0': 'error-types', 'debug:1': 'error-types', 'debug:2': 'error-types', 'hardware:0': 'ram-volatile', 'internet:0': 'internet-www', 'internet:2': 'internet-www', 'tools:0': 'compile-interpret', 'flowcharts:0': 'flow-shapes', 'flowcharts:1': 'flow-shapes', 'lang:1': 'binary', 'threats:1': 'phishing-flags', 'threats:2': 'phishing-flags' };
// interpreter error → tag
export const errTag = e => e.kind === 'NameError' ? 'name-before-assign' : e.kind === 'IndentationError' ? 'indent' : e.kind === 'LoopError' ? 'infinite-loop' : e.kind === 'TypeError' && /between (str and int|int and str)/.test(e.msg.en) ? 'str-int-concat' : e.kind === 'SyntaxError' && /":"/.test(e.msg.en) ? 'missing-colon' : null;

export function learner(S, save) {
  const k = () => (S.know ||= {}), m = () => (S.mis ||= {}), q = () => (S.missed ||= {});
  const bkt = (p, ok) => { const post = ok ? p * (1 - SL) / (p * (1 - SL) + (1 - p) * G) : p * SL / (p * SL + (1 - p) * (1 - G)); return post + (1 - post) * TR; };
  const api = {
    observe(topic, ok, { tag = null, qkey = null, weight = 1 } = {}) {
      const c = k()[topic] ||= { p: .3, n: 0 };
      for (let i = 0; i < weight; i++) c.p = bkt(c.p, ok); c.n++;
      if (tag) { if (ok) { if (m()[tag]) m()[tag] = Math.max(0, m()[tag] - 1); } else m()[tag] = (m()[tag] || 0) + 1; }
      if (qkey) { if (ok) delete q()[qkey]; else q()[qkey] = Date.now(); }
      save();
    },
    answer(topic, qi, ok) { const key = `${topic}:${qi}`; api.observe(topic, ok, { tag: QTAG[key], qkey: key }); },
    codeError(topic, err) { const tag = errTag(err); api.observe(tag ? MIS[tag][0] : topic, false, { tag }); },
    mastery: topic => k()[topic]?.p ?? null,
    level: topic => { const p = api.mastery(topic); return p === null ? 'new' : p >= .85 ? 'strong' : p >= .6 ? 'growing' : 'weak'; },
    tagsFor: topic => Object.entries(m()).filter(([t, n]) => n > 0 && MIS[t]?.[0] === topic).sort((a, b) => b[1] - a[1]).map(([t]) => t),
    allTags: () => Object.entries(m()).filter(([t, n]) => n > 0 && MIS[t]).sort((a, b) => b[1] - a[1]).map(([t]) => t),
    weakest: (topics, n = 3) => topics.filter(t => api.mastery(t.id) !== null && api.mastery(t.id) < .6 || api.tagsFor(t.id).length).sort((a, b) => (api.mastery(a.id) ?? 0) - (api.mastery(b.id) ?? 0)).slice(0, n),
    missed: () => Object.keys(q()).sort((a, b) => q()[a] - q()[b]),
  };
  return api;
}
