// Facts on this page come from the repository README and docs/installation.md.

export const REPO = 'https://github.com/Phantom-Con-Artist/unparalleled-skillset';
const CLI = 'npx github:Phantom-Con-Artist/unparalleled-skillset';
export const INSTALL = `${CLI} setup`;
export const cli = (command) => `${CLI} ${command}`;

// Three real captures of one Studio run on the practice page that ships with the package. The agent step was done by hand
// through the same local tools an agent calls.
export const STUDIO_SHOTS = [
  ['studio-picker', 'A browser window on another site, Loom. Its page shows the heading Weave your week. and a dark green button, Start your first thread, with a gold offset shadow, outlined as the chosen component. A small dark toolbar at the top reads Selected #start. Press Use this component, with buttons Pick a component, Use this component and Cancel.', 'Open any site in a real window, browse to the page you want, press Pick a component and click the one you like.'],
  ['studio-composer', 'The Fieldwork practice page with its Record an observation button outlined in red and a composer beside it. The composer holds the instruction Keep my label. Match its flat dark fill and offset gold shadow., a small chip naming the picked component, a menu set to Recreate it here, and a Send to agent button.', 'Back on your page the component is attached to your button. Choose inspire, recreate or redesign, add your own words, and send.'],
  ['studio-review', 'The same page after the edit: the Record an observation button now has square corners and an offset gold shadow. The Activity panel says Ready for your review, shows the instruction and the summary Matched the reference button, names index.html, and offers Keep edit and Undo source edit.', 'Your agent edits the source and replies. The page updates, and you keep the edit or undo it.'],
];

// The size chart: every integration the installer supports, with its native skill folders.
export const AGENTS = [
  ['Claude Code', '.claude/skills', '~/.claude/skills'],
  ['Codex', '.agents/skills', '~/.agents/skills'],
  ['Cursor', '.cursor/skills', '~/.cursor/skills'],
  ['GitHub Copilot', '.github/skills', '~/.copilot/skills'],
  ['Gemini CLI', '.gemini/skills', '~/.gemini/skills'],
  ['Antigravity', '.agents/skills', '~/.gemini/config/skills'],
  ['Windsurf', '.windsurf/skills', '~/.codeium/windsurf/skills'],
  ['Devin', '.devin/skills', '~/.config/devin/skills'],
  ['OpenCode', '.opencode/skills', '~/.config/opencode/skills'],
  ['Cline', '.cline/skills', '~/.cline/skills'],
  ['Roo Code', '.roo/skills', '~/.roo/skills'],
  ['Kiro', '.kiro/skills', '~/.kiro/skills'],
];

// The fitting: each correction is something the skill's screenshot loop catches.
// `flag` names the capture-report key when it is measured; otherwise it is judged from the screenshot.
export const CORRECTIONS = [
  {
    flag: 'eyebrow-labels, status-dots',
    measured: true,
    title: 'Cut the eyebrow and the live dot',
    note: 'A tiny tracked label with a glowing dot sits above the headline. It says nothing about pottery. Cut it and let the heading speak.',
  },
  {
    flag: 'generic-type',
    measured: true,
    title: 'Choose a face for the subject',
    note: 'The default sans could sell anything. A calligraphic serif that matches the atelier’s wordmark gives the page a voice of its own.',
  },
  {
    flag: 'judged: human writing',
    measured: false,
    title: 'Say something true',
    note: '“Elevate your space with artisanal ceramics” is a slogan any shop could print. The atelier makes each pot once, so the page says that.',
  },
  {
    flag: 'pill-shape, saas-palette',
    measured: true,
    title: 'Square the buttons, drop the indigo',
    note: 'Two pill buttons in stock indigo and a ghost twin. One square button in the clay’s own umber, with a fine rim like a gold lip, does the job.',
  },
  {
    flag: 'card-grid',
    measured: true,
    title: 'Replace three cards with one piece',
    note: 'Three framed boxes of icon, heading and sentence. A single photograph of the actual pot proves more than all three promises.',
  },
  {
    flag: 'judged: hero kit',
    measured: false,
    title: 'Let the object own the first frame',
    note: 'A blurred gradient behind a centred slogan becomes the studio itself: the pot on its plinth under one spotlight.',
  },
];

export const DEMOS = [
  {
    name: 'Claude, in one prompt',
    href: '/claude/',
    kind: 'website',
    agent: 'Claude Code',
    stack: 'One HTML file, inline SVG',
    prompt: 'Create a website introducing you as Claude AI using unparalleled-website skill. You are the product. Sell Yourself!',
    images: [['claude-desktop', 'A pale graph-paper page headed “Hand me the tangle.” with a coral scribble looping across the upper right.'], ['claude-scroll', 'Further down the same page: the handoff section, “Pick a tangle. Watch it come undone.”']],
    phone: ['claude-phone', 'The Claude page on a phone.'],
    note: 'One prompt, no follow-ups. Claude Code researched itself, chose a governing idea (a coral line that starts as a scribble and pulls straight as you scroll), built a working handoff demo and checked its own screenshots. An unofficial demo, not affiliated with Anthropic.',
  },
  {
    name: 'Poterie Céleste',
    href: '/poterie-celeste/',
    kind: 'website',
    agent: 'Claude Code',
    stack: 'React, React Three Fiber, GSAP, Blender',
    images: [['poterie-celeste-desktop', 'The Poterie Céleste home: a white stoneware pot on a plinth under a spotlight, with the heading “Vessels made once.”'], ['poterie-celeste-shatter', 'The same pot broken into floating pieces as the visitor scrolls, beside a photograph of the Ymir vessel.']],
    phone: ['poterie-celeste-phone', 'Poterie Céleste on a phone.'],
    note: 'A fictional ceramics atelier, directed over a longer session. A pot modelled in Blender breaks apart and mends as you scroll, then returns upside down like a reflection. Collections, pieces, a 3D commission desk and a journal.',
  },
  {
    name: 'Soveriegn Quantum',
    href: '/soveriegn-quantum/',
    kind: 'website',
    agent: 'Claude Code',
    stack: 'React, React Three Fiber, GSAP, Lenis, Blender',
    images: [['soveriegn-quantum-desktop', 'The Soveriegn Quantum home: a dilution refrigerator in its white frame over a floor pit in a long white room, beside the heading “A machine you can open.” and a thermometer reading 296 K.'], ['soveriegn-quantum-city', 'Deep in the same scroll: the surface of the Basilisk 2 chip seen at a grazing angle, its qubits, resonators and airbridges labelled like streets.']],
    phone: ['soveriegn-quantum-phone', 'Soveriegn Quantum on a phone.'],
    note: 'A fictional quantum-hardware company. Scrolling opens a dilution refrigerator modelled in Blender: the frame folds away, the vacuum can and shields lower into a pit, the cooling stages separate, then the camera keeps going into the processor down to a single 0.2 µm Josephson junction while a thermometer falls from 296 K to 10 mK.',
  },
];
