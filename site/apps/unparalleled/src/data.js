// Facts on this page come from the repository README and docs/installation.md.

export const REPO = 'https://github.com/Phantom-Con-Artist/unparalleled-skillset';
export const INSTALL = 'npx github:Phantom-Con-Artist/unparalleled-skillset install all';

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
    name: 'Poterie Céleste',
    href: '/poterie-celeste/',
    kind: 'website',
    stack: 'React, React Three Fiber, GSAP, Blender',
    images: [['poterie-celeste-desktop', 'The Poterie Céleste home: a white stoneware pot on a plinth under a spotlight, with the heading “Vessels made once.”'], ['poterie-celeste-shatter', 'The same pot broken into floating pieces as the visitor scrolls, beside a photograph of the Ymir vessel.']],
    phone: ['poterie-celeste-phone', 'Poterie Céleste on a phone.'],
    note: 'A ceramics atelier. A pot modelled in Blender breaks apart and mends as you scroll, then returns upside down like a reflection. Collections, pieces, a 3D commission desk and a journal.',
  },
  {
    name: 'Hollow',
    href: '/hollow/',
    kind: 'website',
    stack: 'One HTML file',
    images: [['hollow-desktop', 'The Hollow site: a plum bowl on a yellow field under the heading “A pot begins with your hands.”']],
    phone: ['hollow-phone', 'Hollow on a phone.'],
    note: 'A neighbourhood pottery studio that follows one piece through the making. The skill’s website example, scaffolded with one command.',
  },
  {
    name: 'Studio Desk',
    href: '/studio-desk/',
    kind: 'ui',
    stack: 'One HTML file',
    images: [['studio-desk-desktop', 'Studio Desk: a dispatch table of orders with a packing panel for the selected piece.']],
    phone: ['studio-desk-phone', 'Studio Desk on a phone.'],
    note: 'Hollow’s working back office: dispatch, packing states, search, filters, sorting, pagination and undo, with clearly fictional data.',
  },
];
