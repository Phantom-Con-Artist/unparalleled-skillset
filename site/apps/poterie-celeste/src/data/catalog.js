// Everything the site says about the atelier lives here. Poterie Céleste is a specimen:
// no prices, addresses, press, or clients are invented; pieces read "Price on request".

export const ATELIER_EMAIL = 'atelier@poterieceleste.com';

// Responsive renditions written by site/scripts/optimize-images.mjs.
export const IMAGES = {
  'alexanderia-collection': { w: 1536, h: 1024, sizes: [640, 1200, 1536] },
  'bespoke-ivory-kintsugi': { w: 1145, h: 1374, sizes: [640, 1145] },
  'bespoke-rose-ribbon': { w: 1254, h: 1254, sizes: [640, 1200, 1254] },
  'bespoke-teal-wave': { w: 1159, h: 1357, sizes: [640, 1159] },
  'celadon-peony-vase': { w: 1122, h: 1402, sizes: [640, 1122] },
  'christie-wallace-owner': { w: 1122, h: 1402, sizes: [640, 1122] },
  'cobalt-crane-lidded-pot': { w: 1122, h: 1402, sizes: [640, 1122] },
  'collection-overview': { w: 1536, h: 1024, sizes: [640, 1200, 1536] },
  'elegancy-collection': { w: 1536, h: 1024, sizes: [640, 1200, 1536] },
  'ivory-gold-hero': { w: 1536, h: 1024, sizes: [640, 1200, 1536] },
  'oxblood-amphora-vase': { w: 1122, h: 1402, sizes: [640, 1122] },
  'studio-alexanderia': { w: 1122, h: 1402, sizes: [640, 1122] },
  'studio-bespoke-rose': { w: 1122, h: 1402, sizes: [640, 1122] },
  'studio-elegancy': { w: 1122, h: 1402, sizes: [640, 1122] },
  'studio-ymir': { w: 1122, h: 1402, sizes: [640, 1122] },
  'ymir-collection': { w: 1536, h: 1024, sizes: [640, 1200, 1536] },
  'studio-poster': { w: 1920, h: 1080, sizes: [960, 1920], dir: 'models' },
};

export const COLLECTIONS = [
  {
    slug: 'alexanderia',
    name: 'Alexanderia',
    line: 'Black glaze, papyrus and lotus in burnished gold.',
    glaze: { field: '#1e2a55', ink: '#f1e8d8', accent: '#d9b673' },
    scene: 'alexanderia-collection',
    sceneAlt: 'A black amphora with gold papyrus, a carved sandstone jar and a small lapis vase on a marble ledge between columns, palms and sea beyond.',
    body: [
      'The forms come from the storage jars of the old Mediterranean ports: broad shoulders, strong handles, a foot made to stand on stone.',
      'The relief is carved into the leather-hard clay before the first firing. The gold is laid into the cut last and fired on at a lower heat, so it sits in the carving and catches low light instead of shining flat.',
    ],
    specs: [['Glaze', 'Gloss black, burnished gold in the relief'], ['Forms', 'Amphorae, storage jars, a lapis bud vase'], ['Clay', 'Stoneware']],
    pieces: ['alexanderia-amphora'],
  },
  {
    slug: 'elegancy',
    name: 'Elegancy',
    line: 'One ivory glaze, and nothing to hide behind.',
    glaze: { field: '#ebe4d6', ink: '#2b1f19', accent: '#7a5a42' },
    scene: 'elegancy-collection',
    sceneAlt: 'An Elegancy bottle, a low glossy jar and a ribbed beaker on a travertine table by sheer curtains.',
    body: [
      'Porcelain thrown thin, then fluted with a wire loop while the clay is leather-hard, one channel after another down the body.',
      'A single ivory glaze breaks paler on every ridge, so the fluting reads as light rather than decoration. The jars and beakers beside the bottles come from the same clay and the same kiln load.',
    ],
    specs: [['Glaze', 'Satin ivory'], ['Forms', 'Fluted bottles, moon jars, beakers'], ['Clay', 'Porcelain']],
    pieces: ['elegancy-fluted-bottle'],
  },
  {
    slug: 'ymir',
    name: 'Ymir',
    line: 'Built from slabs, folded like drift ice.',
    glaze: { field: '#d3dbde', ink: '#1f1d1c', accent: '#4c5b63' },
    scene: 'ymir-collection',
    sceneAlt: 'A folded white vessel, a pale bowl and a pitted black jar on a dark oak bench, a snowy birch shore through the window.',
    body: [
      'Ymir is the frost giant of the Norse sagas, the first being, out of whose body the world was made.',
      'These pieces are built rather than thrown: slabs pressed, folded and pinched until they stand on their own, then glazed white so the glaze thins over every ridge and pools grey-blue in the folds. The basalt jars beside them are left coarse and dark.',
    ],
    specs: [['Glaze', 'Glacier white; unglazed basalt'], ['Forms', 'Folded vessels, bowls, round jars'], ['Clay', 'Stoneware with grog']],
    pieces: ['ymir-folded-vessel'],
  },
  {
    slug: 'heritage',
    name: 'Heritage glazes',
    line: 'Celadon, cobalt, oxblood, ivory and gold.',
    glaze: { field: '#2a1712', ink: '#f2e6d8', accent: '#d9b673' },
    scene: 'collection-overview',
    sceneAlt: 'Four heritage pieces in four panelled rooms: an ivory and gold vase, an oxblood amphora, a cobalt lidded jar and a celadon vase.',
    body: [
      'The oldest high-fire glazes a potter can reach for, each set in the room it was made for.',
      'Celadon pools pale green in carved relief, cobalt runs deep under painted gold, and copper-red oxblood only turns red in a kiln starved of air. Every one goes on as a dull powder and finds its colour in the fire.',
    ],
    specs: [['Glazes', 'Celadon, cobalt, oxblood, ivory'], ['Gold', 'Burnished, fired on last'], ['Clay', 'Porcelain and stoneware']],
    pieces: ['celadon-peony-vase', 'cobalt-crane-lidded-pot', 'oxblood-amphora-vase', 'ivory-and-gold-pair'],
  },
  {
    slug: 'bespoke',
    name: 'Bespoke',
    line: 'Made for one room and one person.',
    glaze: { field: '#3a120d', ink: '#f5e9dc', accent: '#e0b9a6' },
    scene: 'studio-bespoke-rose',
    sceneAlt: 'A rose-glazed amphora with gold-tipped handles against a soft pink ground.',
    body: [
      'A commission starts with a letter about the room. Christie replies with drawings and fired glaze tests before anything goes on the wheel.',
      'These three were made that way: one to replace a vase that broke, one for a wedding, one for a house above the sea.',
    ],
    specs: [['Process', 'Letter, drawings, glaze tests, throwing, two firings'], ['Gold', 'Optional, fired on last']],
    pieces: ['bespoke-ivory-seams', 'bespoke-rose-ribbon', 'bespoke-teal-swell'],
  },
];

export const PIECES = {
  'celeste-vessel': {
    name: 'Céleste Vessel',
    collection: null,
    image: 'studio-poster',
    alt: 'A white stoneware vessel with a fine groove at the shoulder, standing on a plaster plinth under a spotlight.',
    summary: 'The atelier\'s own form: an ovoid stoneware body, widest high, a short neck, and one fine line cut at the shoulder.',
    details: [['Glaze', 'Matte white with iron speckle'], ['Height', 'About 78 cm'], ['Clay', 'Speckled stoneware']],
    model: true,
  },
  'alexanderia-amphora': {
    name: 'Alexanderia Amphora', collection: 'alexanderia', image: 'studio-alexanderia',
    alt: 'A black amphora with gold papyrus fans rising from a gold band, two looped handles.',
    summary: 'Gloss black over a thrown amphora, the papyrus fans carved and laid with burnished gold.',
    details: [['Glaze', 'Gloss black, burnished gold'], ['Height', 'About 48 cm'], ['Clay', 'Stoneware']],
  },
  'elegancy-fluted-bottle': {
    name: 'Elegancy Fluted Bottle', collection: 'elegancy', image: 'studio-elegancy',
    alt: 'A tall, slender bottle vase in ivory porcelain, fluted from shoulder to foot.',
    summary: 'A tall porcelain bottle, fluted by hand from shoulder to foot under one satin ivory glaze.',
    details: [['Glaze', 'Satin ivory'], ['Height', 'About 52 cm'], ['Clay', 'Porcelain']],
  },
  'ymir-folded-vessel': {
    name: 'Ymir Folded Vessel', collection: 'ymir', image: 'studio-ymir',
    alt: 'A folded white vessel, the white glaze breaking blue-grey along its creases.',
    summary: 'Slab-built and folded, glazed white so the colour thins on the ridges and pools blue-grey in the creases.',
    details: [['Glaze', 'Glacier white'], ['Height', 'About 44 cm'], ['Clay', 'Stoneware with grog']],
  },
  'celadon-peony-vase': {
    name: 'Celadon Peony Vase', collection: 'heritage', image: 'celadon-peony-vase',
    alt: 'A baluster vase in pale celadon, peonies carved in relief, gilt at the lip and foot.',
    summary: 'Pale celadon pooling into peonies carved in relief, gilt at the lip and the foot.',
    details: [['Glaze', 'Celadon'], ['Gold', 'Lip and foot'], ['Clay', 'Porcelain']],
  },
  'cobalt-crane-lidded-pot': {
    name: 'Cobalt Crane Lidded Pot', collection: 'heritage', image: 'cobalt-crane-lidded-pot',
    alt: 'A lidded jar in deep cobalt painted with white cranes and gold blossom, a gilt finial on the lid.',
    summary: 'A cobalt ground under cranes and blossom in gold, the domed lid finished with a gilt finial.',
    details: [['Glaze', 'Cobalt'], ['Gold', 'Painted blossom, finial'], ['Clay', 'Porcelain']],
  },
  'oxblood-amphora-vase': {
    name: 'Oxblood Amphora Vase', collection: 'heritage', image: 'oxblood-amphora-vase',
    alt: 'An amphora in glossy oxblood red with gold scrollwork over the shoulder and handles.',
    summary: 'Copper-red over a thrown amphora, the handles and shoulder scrolled in burnished gold.',
    details: [['Glaze', 'Oxblood copper-red'], ['Gold', 'Scrolled shoulder and handles'], ['Clay', 'Stoneware']],
  },
  'ivory-and-gold-pair': {
    name: 'Ivory and Gold Pair', collection: 'heritage', image: 'ivory-gold-hero',
    alt: 'A tall ivory vase and a round jar covered in raised gold acanthus, on a dark marble console.',
    summary: 'A baluster vase and a round jar, sold together, the ivory glaze carrying raised acanthus in gold.',
    details: [['Glaze', 'Ivory'], ['Gold', 'Raised acanthus'], ['Offered', 'As a pair']],
  },
  'bespoke-ivory-seams': {
    name: 'Ivory, with gold seams', collection: 'bespoke', image: 'bespoke-ivory-kintsugi', cutout: true,
    alt: 'A twisting ivory vase with a wavy rim, gold seams running down its body like mended cracks.',
    summary: 'Made for a hallway where an old vase had broken. The gold seams follow where its cracks had been.',
    details: [['Glaze', 'Ivory'], ['Gold', 'Seams'], ['Status', 'Commissioned, not available']],
    commissioned: true,
  },
  'bespoke-rose-ribbon': {
    name: 'Rose, ribbon handles', collection: 'bespoke', image: 'bespoke-rose-ribbon', cutout: true,
    alt: 'A round rose-pink amphora with two looping ribbon handles and a gold lip.',
    summary: 'A wedding piece, glazed to match the flowers, with handles pulled into loose ribbons.',
    details: [['Glaze', 'Rose'], ['Gold', 'Lip'], ['Status', 'Commissioned, not available']],
    commissioned: true,
  },
  'bespoke-teal-swell': {
    name: 'Teal, carved swell', collection: 'bespoke', image: 'bespoke-teal-wave', cutout: true,
    alt: 'A moon jar carved in deep swells, glazed teal that runs pale on the crests and dark in the troughs.',
    summary: 'For a house above the sea. The swells are carved deep so the teal runs pale on the crests.',
    details: [['Glaze', 'Teal'], ['Gold', 'Lip'], ['Status', 'Commissioned, not available']],
    commissioned: true,
  },
};

export const JOURNAL = [
  {
    slug: 'opening-the-winter-kiln',
    title: 'Opening the winter kiln',
    date: '2026-02-14',
    image: 'ymir-collection',
    alt: 'A folded white vessel and a pitted black jar by a winter window.',
    dek: 'Two days of cooling, then the door. What the Ymir glaze does when the kiln is slow.',
    body: [
      'A kiln holds its heat for a long time. After a glaze firing the door stays shut for two days, and the hardest part of the work is leaving it alone.',
      'The Ymir glaze is thin on purpose. On the ridges of a folded slab it barely covers the clay, and in the creases it pools into something nearer grey-blue than white. A slow cool gives it time to settle, so a winter firing, with the studio cold around the kiln, tends to give the softest blue.',
      'This load had nine pieces. Seven came through. The two that did not are already in the reclaim bucket, which is where cracked work belongs.',
    ],
  },
  {
    slug: 'why-the-gold-goes-on-last',
    title: 'Why the gold goes on last',
    date: '2026-05-03',
    image: 'studio-alexanderia',
    alt: 'The Alexanderia amphora: black glaze with gold papyrus fans.',
    dek: 'Gold cannot survive the heat of a glaze firing, so every gilded piece is fired three times.',
    body: [
      'Gold melts long before a glaze matures, so it is always the last thing to go on. The pot is bisque fired, glazed and fired hot, and only then is the gold painted into the carving and fired again at a much lower heat.',
      'On the Alexanderia pieces the papyrus is carved before the first firing, so the gold settles into a cut rather than sitting on top. Burnished afterwards, it reads warm and low rather than bright.',
      'A third firing is a third chance to lose a piece. It is worth it.',
    ],
  },
  {
    slug: 'a-vase-for-a-broken-one',
    title: 'A vase for a broken one',
    date: '2026-08-21',
    image: 'bespoke-ivory-kintsugi',
    alt: 'A twisting ivory vase with gold seams.',
    dek: 'A commission that began with a photograph of the pieces of an old vase.',
    body: [
      'The letter came with a photograph of a hallway table and, beside it, the pieces of the vase that used to stand there.',
      'Rather than copy the old shape, the new one twists, and the gold seams run where the old cracks ran in the photograph. It is a new vase that remembers the one before it.',
      'Commissions like this take a season: drawings, glaze tests, two attempts on the wheel, and the long wait at the kiln door.',
    ],
  },
];

export const pieceUrl = (slug) => `/pieces/${slug}`;
export const collectionUrl = (slug) => `/collections/${slug}`;
export const findCollection = (slug) => COLLECTIONS.find((c) => c.slug === slug);
