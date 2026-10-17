import test from 'node:test'; import assert from 'node:assert/strict';
import { runSync } from '../interp.js';
const cases = [
  ['print(1+2*3)', '7'], ['print(7/2, 7//2, 7%3, 2**10)', '3.5 3 1 1024'], ['print(-7//2, -7%3)', '-4 2'],
  ['x=5\nx+=2\nprint(x)', '7'], ['print("ab"*3+"c")', 'ababababc'.slice(0, 6) + 'c'],
  ['a=[1,2]\na.append(3)\nprint(a, len(a), a[-1])', '[1, 2, 3] 3 3'],
  ['for i in range(3):\n    print(i)', '0\n1\n2'], ['n=0\nwhile n<3:\n    n+=1\nprint(n)', '3'],
  ['m=60\nif m>=80:\n    print("A")\nelif m>=50:\n    print("C")\nelse:\n    print("F")', 'C'],
  ['print(int("12")+1, float(3), str(4)+"x", True and False, not 0)', '13 3.0 4x False True'],
  ['print(type(1), type(1.5), type("a"), type(True), type(None))', "<class 'int'> <class 'float'> <class 'str'> <class 'bool'> <class 'NoneType'>"],
  ['for i in range(10):\n    if i==2:\n        continue\n    if i==4:\n        break\n    print(i)', '0\n1\n3'],
  ['print(round(2.567,2), abs(-3), 10/5)', '2.57 3 2.0'], ['print(1 == 1.0, "a" in "cat", 3 in [1,3])', 'True True True'],
];
for (const [src, want] of cases) test(src.slice(0, 30), () => assert.equal(runSync(src).out, want));
const errs = [['print(age)', 'NameError'], ['print("5"+5)', 'TypeError'], ['print(1/0)', 'ZeroDivisionError'], ['if 1:\nprint(1)', 'IndentationError'], ['print("a)', 'SyntaxError'], ['while True:\n    pass', 'LoopError'], ['int("x")', 'ValueError'], ['a=[1]\nprint(a[3])', 'IndexError']];
for (const [src, kind] of errs) test('err ' + kind, () => { const e = runSync(src).error; assert.equal(e.kind, kind); assert.ok(e.msg.sw); });
test('input', () => assert.equal(runSync('n=int(input("n"))\nprint(n*2)', ['21']).out, '42'));
