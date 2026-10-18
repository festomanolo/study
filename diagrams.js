// Hand-drawn ink diagrams, one per topic. Every part is clickable (info), can be hidden for Active Recall, and can pulse in the simulator.
// part = [id, label, x, y, w, h, info, shape?]; arrow = [x1, y1, x2, y2, dashed?]; sim = [[text, [part ids]], ...]. viewBox is 600 x 252.
const grid = (labels, cols, infos = [], y0 = 24) => {
  const n = labels.length, rows = Math.ceil(n / cols), w = Math.min(150, Math.floor(560 / cols) - 24), gx = (600 - cols * w) / (cols + 1), h = 52, gy = rows > 1 ? (252 - y0 - rows * h - 10) / (rows - 1) : 0;
  const parts = labels.map((l, i) => [`s${i}`, l, gx + (i % cols) * (w + gx), rows > 1 ? y0 + Math.floor(i / cols) * (h + gy) : 100, w, h, infos[i] || l]);
  const arrows = [];
  parts.forEach((p, i) => { if (i + 1 < n) { const q = parts[i + 1]; if (Math.floor((i + 1) / cols) === Math.floor(i / cols)) arrows.push([p[2] + w, p[3] + h / 2, q[2], q[3] + h / 2]); else arrows.push([p[2] + w / 2, p[3] + h, q[2] + w / 2, q[3], true]); } });
  return { parts, arrows };
};
const withSim = (g, texts) => ({ ...g, sim: texts.map((t, i) => [t, [`s${i}`]]) });

export const DIAGRAMS = {
'cs-concept': { parts: [
  ['cs', 'Computer Science', 220, 90, 160, 60, 'Theory and problem solving: algorithms, programming, how computers process information.', 'ellipse'],
  ['ce', 'Computer Engineering', 20, 20, 170, 46, 'Designs and builds the hardware: chips, circuit boards, devices.'],
  ['it', 'Information Technology', 410, 20, 170, 46, 'Installs, runs and supports computer systems and networks for an organisation.'],
  ['ict', 'ICT', 20, 180, 150, 46, 'Using computers and communication tools (phones, internet, radio) to handle information.'],
  ['is', 'Information Systems', 430, 180, 150, 46, 'Using ICT to help a business run, for example a shop stock system.']],
  arrows: [[190, 56, 240, 100], [410, 56, 360, 100], [170, 190, 240, 140], [430, 190, 360, 140]],
  sim: [['Computer Engineering builds the machine.', ['ce']], ['Computer Science makes it solve problems.', ['cs']], ['IT keeps systems running for people.', ['it']], ['ICT and IS use the technology in daily life and business.', ['ict', 'is']]] },
'sys-types': { parts: [
  ['in', 'Input', 30, 40, 120, 56, 'Data enters the computer: keyboard, mouse, scanner, microphone.'],
  ['proc', 'Processing', 240, 40, 130, 56, 'The CPU works on the data following the instructions of a program.'],
  ['out', 'Output', 460, 40, 110, 56, 'Results come out: screen (soft copy), printer (hard copy), speaker.'],
  ['store', 'Storage', 240, 160, 130, 56, 'Data and results are kept for later: hard disk, flash disk, memory card.']],
  arrows: [[150, 68, 240, 68], [370, 68, 460, 68], [305, 96, 305, 160]],
  sim: [['1. INPUT: you type 4 + 5.', ['in']], ['2. PROCESSING: the CPU adds the numbers.', ['proc']], ['3. OUTPUT: 9 appears on the screen.', ['out']], ['4. STORAGE: the answer is saved in the history.', ['store']]] },
'hardware': { parts: [
  ['in', 'Input devices', 15, 18, 125, 46, 'Keyboard, mouse, scanner, microphone: they send data in.'],
  ['cu', 'Control Unit', 200, 18, 95, 46, 'Part of the CPU. Fetches and decodes instructions and directs the other parts.'],
  ['alu', 'ALU', 305, 18, 95, 46, 'Arithmetic and Logic Unit. Does calculations and comparisons.'],
  ['out', 'Output devices', 460, 18, 125, 46, 'Monitor, printer, speakers: they show results.'],
  ['ram', 'RAM', 200, 112, 200, 46, 'Short-term memory. Holds the programs and data in use. Volatile: erased when power goes off.'],
  ['disk', 'Hard disk', 200, 192, 200, 46, 'Permanent storage. Keeps files when the power is off.'],
  ['psu', 'Power supply', 455, 150, 130, 46, 'Changes mains electricity into the low voltage the parts need.']],
  arrows: [[140, 41, 200, 41], [400, 41, 460, 41], [247, 64, 247, 112], [353, 64, 353, 112], [300, 158, 300, 192]],
  sim: [['1. FETCH: an instruction is copied from RAM to the CPU.', ['ram', 'cu']], ['2. DECODE: the Control Unit works out what to do.', ['cu']], ['3. EXECUTE: the ALU carries it out.', ['alu']], ['4. WRITE-BACK: the result goes back to RAM.', ['alu', 'ram']], ['5. SAVE: when you press Save it is copied to the hard disk.', ['disk']]] },
'software': { parts: [
  ['sw', 'Software', 225, 8, 150, 42, 'Instructions that tell the hardware what to do.'],
  ['sys', 'System software', 60, 84, 180, 44, 'Runs and manages the computer itself.'],
  ['app', 'Application software', 360, 84, 190, 44, 'Helps you do a particular job.'],
  ['os', 'Operating system', 10, 168, 125, 52, 'Controls hardware, runs programs and manages files. Examples: Windows, Linux, Android.'],
  ['util', 'Utilities', 145, 168, 100, 52, 'Antivirus, backup, disk cleanup, file compression.'],
  ['word', 'Word processor', 335, 168, 120, 52, 'Letters and reports.'],
  ['web', 'Browser', 465, 168, 110, 52, 'Opens web pages on the internet.']],
  arrows: [[290, 50, 150, 84], [310, 50, 450, 84], [120, 128, 72, 168], [180, 128, 195, 168], [430, 128, 395, 168], [480, 128, 520, 168]] },
'handling': { parts: [
  ['pc', 'Your computer', 30, 100, 150, 56, 'Keep it clean, cool, and shut it down properly.'],
  ['flash', 'Flash disk copy', 400, 24, 170, 56, 'A second copy on another device. Eject it safely.'],
  ['cloud', 'Online copy', 400, 170, 170, 56, 'A third copy online, safe if the room is damaged.'],
  ['ups', 'Surge protector / UPS', 200, 200, 170, 40, 'Protects against power surges and short power cuts.']],
  arrows: [[180, 118, 400, 56], [180, 140, 400, 190], [280, 200, 130, 156, true]],
  sim: [['Your work is saved on the computer.', ['pc']], ['Copy it to a flash disk: backup 1.', ['flash']], ['Copy it online: backup 2.', ['cloud']], ['If the disk fails you still have your work.', ['flash', 'cloud']]] },
'install-files': { parts: [
  ['root', 'Documents', 20, 100, 120, 48, 'The main folder.'], ['f1', 'Form1', 175, 100, 110, 48, 'A folder for the class.'],
  ['sub', 'Computer', 320, 40, 120, 48, 'A folder for the subject.'], ['sub2', 'Geography', 320, 170, 120, 48, 'Another subject folder.'],
  ['file', 'notes.docx', 470, 40, 115, 48, 'A file: name + extension. The path is Documents/Form1/Computer/notes.docx.']],
  arrows: [[140, 124, 175, 124], [285, 124, 320, 64], [285, 124, 320, 194], [440, 64, 470, 64]] },
'ps-steps': withSim(grid(['1. Define', '2. Analyse', '3. Plan', '4. Implement', '5. Test', '6. Improve'], 3, ['Write clearly what must be solved.', 'Collect facts and break the problem into parts.', 'Choose a method; write an algorithm or flowchart.', 'Carry out the plan or write the program.', 'Check with sample data.', 'Fix mistakes and document the solution.']),
  ['Define the problem: input and expected output.', 'Analyse: what do we know, what is missing?', 'Plan the steps (algorithm).', 'Implement the plan.', 'Test with data you know the answer to.', 'Improve and document.']),
'algorithms': { parts: [
  ['seq', 'Sequence', 20, 30, 160, 50, 'Steps one after another.'], ['sel', 'Selection', 220, 30, 160, 50, 'Choose a path with a question (if / else).'], ['rep', 'Repetition', 420, 30, 160, 50, 'Repeat steps while a condition holds (loops).'],
  ['a1', 'Step 1', 50, 120, 100, 36, 'Do this first.'], ['a2', 'Step 2', 50, 180, 100, 36, 'Then this.'],
  ['q', 'mark >= 50 ?', 235, 120, 130, 56, 'A yes/no question decides which path to follow.', 'diamond'], ['yes', 'Pass', 215, 200, 80, 36, 'Yes path.'], ['no', 'Fail', 305, 200, 80, 36, 'No path.'],
  ['loop', 'Repeat 5 times', 440, 125, 120, 50, 'Go back and repeat until the condition ends.']],
  arrows: [[100, 80, 100, 120], [100, 156, 100, 180], [300, 80, 300, 120], [265, 160, 255, 200], [335, 160, 345, 200], [500, 80, 500, 125], [560, 150, 580, 150], [580, 150, 580, 100, true], [580, 100, 520, 100, true]] },
'flowcharts': { parts: [
  ['term', 'Start / End', 20, 18, 150, 44, 'Oval: begins or ends the flowchart.', 'ellipse'],
  ['io', 'Input / Output', 20, 78, 150, 44, 'Parallelogram: read data in or show results.'],
  ['proc', 'Process', 20, 138, 150, 44, 'Rectangle: a calculation or action.'],
  ['dec', 'Decision', 20, 198, 150, 46, 'Diamond: a yes/no question with two exits.', 'diamond'],
  ['s', 'Start', 330, 8, 100, 36, 'Begin here.', 'ellipse'], ['r', 'READ x', 320, 62, 120, 36, 'Input a number.'], ['c', 'x >= 50 ?', 320, 114, 120, 50, 'Decision.', 'diamond'],
  ['p', 'PRINT Pass', 470, 122, 115, 34, 'Yes: show Pass.'], ['f', 'PRINT Fail', 195, 122, 115, 34, 'No: show Fail.'], ['e', 'End', 330, 206, 100, 34, 'Stop.', 'ellipse']],
  arrows: [[380, 44, 380, 62], [380, 98, 380, 114], [440, 139, 470, 139], [320, 139, 310, 139], [527, 156, 400, 206], [252, 156, 360, 206]],
  sim: [['START the flowchart.', ['s']], ['READ x: the user enters 64.', ['r']], ['DECISION: is 64 >= 50? Yes.', ['c']], ['Follow the Yes arrow: PRINT Pass.', ['p']], ['END.', ['e']]] },
'internet': { parts: [
  ['dev', 'Your phone', 15, 90, 120, 52, 'A device with a browser.'], ['isp', 'ISP / router', 165, 90, 120, 52, 'Internet Service Provider: connects you to the internet.'],
  ['net', 'Internet', 315, 20, 120, 52, 'Worldwide network of networks: cables, satellites, routers.', 'ellipse'], ['net2', 'Another route', 315, 170, 130, 52, 'If one road is blocked, data takes another.', 'ellipse'],
  ['srv', 'Web server', 470, 90, 115, 52, 'A computer that stores the website and sends the page.']],
  arrows: [[135, 116, 165, 116], [285, 105, 315, 56], [285, 127, 315, 190], [435, 56, 470, 105], [445, 190, 470, 127]],
  sim: [['You type a web address in the browser.', ['dev']], ['Your request goes to the ISP.', ['isp']], ['It travels across the internet to the server.', ['net']], ['The server finds the page and sends it back (another route if needed).', ['srv', 'net2']], ['The page appears on your phone.', ['dev']]] },
'threats': { parts: [
  ['mal', 'Malware', 20, 20, 150, 46, 'Harmful software: virus, worm, trojan, ransomware, spyware.'], ['phi', 'Phishing', 20, 100, 150, 46, 'Fake messages that trick you into giving PINs and passwords.'], ['hack', 'Hacking', 20, 180, 150, 46, 'Getting into a system without permission.'],
  ['you', 'You + your data', 235, 90, 130, 66, 'Your accounts, money, photos and files.', 'ellipse'],
  ['av', 'Antivirus', 430, 20, 150, 46, 'Finds and removes malware. Keep it updated.'], ['pw', 'Strong passwords', 430, 100, 150, 46, 'Different, long passwords plus two-step verification.'], ['think', 'Think first', 430, 180, 150, 46, 'Do not click unknown links; never share your PIN.']],
  arrows: [[170, 43, 240, 105], [170, 123, 235, 123], [170, 203, 240, 142], [430, 43, 360, 105], [430, 123, 365, 123], [430, 203, 360, 142]] },
'ethics': withSim(grid(['Think', 'Is it true?', 'Is it kind?', 'Is it mine to share?', 'Post'], 5, ['Pause before you post or send.', 'Do not spread rumours or lies.', 'Respect people; no cyber-bullying.', 'Do not copy others\' work or share private photos without permission.', 'If all answers are yes, it is safe to post.']),
  ['Pause and think before posting.', 'Check: is it true?', 'Check: is it kind?', 'Check: is it yours to share? Give credit.', 'Now you may post.']),
'passwords': { parts: [
  ['weak', 'Weak: 12345', 20, 30, 160, 50, 'Short, common, guessed in seconds.'], ['ok', 'OK: Neema2010', 220, 30, 160, 50, 'Uses a name and a year, easy to guess.'], ['strong', 'Strong passphrase', 420, 30, 160, 50, 'Long, random words with numbers and symbols, e.g. maji-Chai#47-simba.'],
  ['len', 'Length 12+', 20, 150, 130, 50, 'Longer is stronger.'], ['mix', 'Mix characters', 175, 150, 130, 50, 'Uppercase, lowercase, numbers, symbols.'], ['two', 'Two-step login', 330, 150, 120, 50, 'A code sent to your phone after the password.'], ['uniq', 'One per account', 470, 150, 115, 50, 'Never reuse a password.']],
  arrows: [[180, 55, 220, 55], [380, 55, 420, 55], [85, 150, 85, 80, true], [240, 150, 340, 80, true]] },
'lang': { parts: [
  ['mach', 'Machine language (0 and 1)', 20, 190, 230, 46, 'The only language the CPU understands directly.'],
  ['asm', 'Assembly language', 20, 110, 230, 46, 'Short codes like ADD and MOV. Needs an assembler.'],
  ['high', 'High-level language', 20, 30, 230, 46, 'Close to English: Python, Java, C. Needs a compiler or interpreter.'],
  ['trans', 'Compiler / Interpreter', 330, 100, 220, 60, 'Translates your code down to machine language.', 'ellipse']],
  arrows: [[135, 76, 135, 110], [135, 156, 135, 190], [250, 53, 340, 105], [330, 135, 250, 200]],
  sim: [['You write a high-level program such as print("Hi").', ['high']], ['A translator converts it.', ['trans']], ['It becomes machine language the CPU can run.', ['mach']]] },
'tools': { parts: [
  ['src', 'Source code', 15, 20, 120, 46, 'The program you write.'], ['comp', 'Compiler', 190, 20, 110, 46, 'Translates the whole program first, then it runs.'], ['exe', 'Machine code', 355, 20, 120, 46, 'Runs fast.'], ['cpu', 'CPU runs it', 505, 20, 85, 46, 'Executes the instructions.'],
  ['src2', 'Source code', 15, 150, 120, 46, 'The program you write.'], ['int', 'Interpreter', 190, 150, 110, 46, 'Translates and runs ONE line at a time; stops at the first error.'], ['line', 'Line by line', 355, 150, 120, 46, 'Easy for learning; slower.'], ['cpu2', 'CPU runs it', 505, 150, 85, 46, 'Executes each line.']],
  arrows: [[135, 43, 190, 43], [300, 43, 355, 43], [475, 43, 505, 43], [135, 173, 190, 173], [300, 173, 355, 173], [475, 173, 505, 173]],
  sim: [['COMPILER: translate the whole book first.', ['src', 'comp']], ['Then the finished machine code runs quickly.', ['exe', 'cpu']], ['INTERPRETER: translate and run line by line.', ['src2', 'int']], ['Stops at the first error: good for beginners.', ['line', 'cpu2']]] },
'setup': withSim(grid(['1. Download', '2. Install', '3. Tick PATH', '4. python --version', '5. Write hello.py'], 5, ['Get the installer from python.org or your teacher.', 'Run the installer.', 'Tick "Add Python to PATH" before Install.', 'Check it works in the terminal.', 'Save code with the .py extension and run it.']),
  ['Download the installer.', 'Run it.', 'Tick Add Python to PATH.', 'Type python --version in the terminal.', 'Write and run your first program.']),
'first': { parts: [
  ['fn', 'print', 20, 90, 100, 56, 'A built-in function that shows output on the screen.'], ['br', '( )', 135, 90, 70, 56, 'Round brackets hold the argument.'], ['str', '"Hello"', 220, 90, 120, 56, 'Text in quotation marks is a string.'], ['cm', '# comment', 380, 90, 200, 56, 'Python ignores everything after #. Notes for humans.'],
  ['err', 'SyntaxError?', 140, 190, 140, 44, 'You broke a language rule: missing quote or bracket.'], ['inp', 'input()', 330, 190, 120, 44, 'Waits for the user to type; returns text.']],
  arrows: [[120, 118, 135, 118], [205, 118, 220, 118], [340, 118, 380, 118]],
  sim: [['print is the function name.', ['fn']], ['Brackets hold what to print.', ['br']], ['The text goes inside quotation marks.', ['str']], ['After # Python ignores the rest of the line.', ['cm']]] },
'vars': { parts: [
  ['name', 'name: age', 20, 40, 150, 50, 'The variable name. Case-sensitive, no spaces, cannot start with a digit.'], ['val', 'value: 15', 225, 40, 150, 50, 'The value stored. Assigning again replaces it.'], ['type', 'type: int', 430, 40, 150, 50, 'int whole, float decimal, str text, bool True/False.'],
  ['int', 'int  15', 20, 160, 120, 50, 'Whole numbers.'], ['flo', 'float  3.5', 160, 160, 130, 50, 'Decimal numbers.'], ['str', 'str  "Neema"', 310, 160, 140, 50, 'Text.'], ['bool', 'bool  True', 470, 160, 115, 50, 'True or False.']],
  arrows: [[170, 65, 225, 65], [375, 65, 430, 65], [505, 90, 505, 160, true]],
  sim: [['age = 15 creates a box named age.', ['name']], ['It stores the value 15.', ['val']], ['Python decides the type: int.', ['type']], ['age = age + 1 replaces the value with 16.', ['val']]] },
'branch': { parts: [
  ['s', 'mark = 72', 235, 8, 130, 36, 'Start with a value.'], ['c', 'mark >= 50 ?', 225, 62, 150, 58, 'A condition: True or False.', 'diamond'],
  ['y', 'print("Pass")', 400, 100, 150, 40, 'Runs when True (indented under if).'], ['n', 'print("Fail")', 50, 100, 150, 40, 'Runs when False (else).'],
  ['l', 'for i in range(1, 6)', 215, 175, 170, 44, 'A loop repeats the indented lines.'], ['w', 'while n <= 5', 410, 190, 150, 44, 'Repeats while the condition stays True.']],
  arrows: [[300, 44, 300, 62], [375, 91, 400, 110], [225, 91, 200, 110], [385, 197, 410, 212, true]],
  sim: [['mark = 72 is stored.', ['s']], ['Python evaluates: 72 >= 50 is True.', ['c']], ['So the if branch runs: Pass.', ['y']], ['A loop could repeat this for every student.', ['l']]] },
'debug': { parts: [
  ['syn', 'Syntax error', 20, 30, 170, 50, 'You broke the rules (missing colon or quote). The program will not run; Python names the line.'], ['run', 'Runtime error', 215, 30, 170, 50, 'Crashes while running: divide by zero, NameError, TypeError.'], ['logic', 'Logic error', 410, 30, 170, 50, 'Runs but gives the wrong answer, e.g. + instead of *. No error message.'],
  ['read', 'Read the message', 20, 150, 130, 50, 'Note the error and the line number.'], ['prt', 'print values', 165, 150, 130, 50, 'Add print to see what variables hold.'], ['step', 'Step through', 310, 150, 130, 50, 'Run one line at a time.'], ['fix', 'Fix + retest', 455, 150, 130, 50, 'Change one thing, run again.']],
  arrows: [[85, 80, 85, 150, true], [300, 80, 230, 150, true], [495, 80, 520, 150, true], [150, 175, 165, 175], [295, 175, 310, 175], [440, 175, 455, 175]] },
'project': withSim(grid(['Define', 'Plan', 'Code', 'Test', 'Debug', 'Comment'], 3, ['What must the program do?', 'Write pseudocode or a flowchart.', 'Write a few lines, run often.', 'Try 0, 49, 50 and 100.', 'Fix errors one at a time.', 'Explain tricky lines.']),
  ['Define what the grade calculator must do.', 'Plan with pseudocode.', 'Code it a few lines at a time.', 'Test the edge marks.', 'Debug any errors.', 'Add comments.']),
};
