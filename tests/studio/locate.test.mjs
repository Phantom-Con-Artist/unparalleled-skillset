import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { startStudio } from '../../packages/studio-engine/src/index.mjs';
import { locateSource, termsFor } from '../../packages/studio-agent-tools/src/locate.mjs';
import { run } from '../../packages/studio-agent-tools/src/cli.mjs';

async function project(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-locate-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, 'src/components'), { recursive: true });
  await fs.mkdir(path.join(root, 'node_modules/pkg'), { recursive: true });
  await fs.mkdir(path.join(root, '.secret'), { recursive: true });
  await fs.writeFile(path.join(root, 'src/components/Hero.jsx'), 'export const Hero = () => (\n  <section>\n    <h1 className="title big" id="hero">Every branch tells you something.</h1>\n  </section>\n);\n');
  await fs.writeFile(path.join(root, 'src/styles.css'), '.title { font-weight: 800; }\n#hero { margin: 0; }\n.footer { color: gray; }\n');
  await fs.writeFile(path.join(root, 'node_modules/pkg/index.js'), '// Every branch tells you something.\n');
  await fs.writeFile(path.join(root, '.secret/notes.md'), 'Every branch tells you something.\n');
  await fs.writeFile(path.join(root, 'src/binary.js'), Buffer.from([0, 1, 2, 3]));
  return root;
}
const selection = { selector: 'h1#hero', tag: 'h1', text: 'Every branch tells you something.', html: '<h1 class="title big" id="hero">Every branch tells you something.</h1>' };

test('terms come from the element and only distinctive ones are used', () => {
  assert.deepEqual(termsFor(selection), { id: 'hero', classes: ['title', 'big'], data: [], text: 'Every branch tells you something.' });
  assert.deepEqual(termsFor({ selector: 'div', text: 'ok', html: '<div class="a b">ok</div>' }), { id: null, classes: [], data: [], text: null });
});

test('locate ranks the file that owns the element first and lists why', async t => {
  const root = await project(t);
  const result = await locateSource(root, selection);
  assert.equal(result.candidates[0].file, 'src/components/Hero.jsx');
  assert.equal(result.candidates[0].line, 3);
  assert.ok(result.candidates[0].reasons.includes('contains the element text'));
  assert.ok(result.candidates.some(item => item.file === 'src/styles.css' && item.reasons.includes('mentions class title')), 'the stylesheet rule is also offered');
  assert.ok(!result.candidates.some(item => item.file.includes('node_modules') || item.file.includes('.secret') || item.file.includes('binary')), 'private, dependency and binary files are never searched');
  assert.ok(!result.candidates.some(item => /footer/.test(item.snippet)), 'unrelated lines are not offered');
});

test('locate says so when there is nothing distinctive to search for', async t => {
  const root = await project(t);
  const result = await locateSource(root, { selector: 'div', text: 'ok', html: '<div>ok</div>' });
  assert.deepEqual(result.candidates, []);
  assert.match(result.note, /Nothing distinctive/);
});

test('the agent CLI locates from text and from a live picked element', async t => {
  const root = await project(t);
  const studio = await startStudio({ root });
  t.after(() => studio.close());
  const fromText = await run(['--project', root, 'locate', '--text', 'Every branch tells you something.']);
  assert.equal(fromText.candidates[0].file, 'src/components/Hero.jsx');
  await assert.rejects(run(['--project', root, 'locate', '--selector', '#hero']), /Open the app with Studio attached|browser/i, 'without a connected page there is no element to inspect, and it says so');
});
