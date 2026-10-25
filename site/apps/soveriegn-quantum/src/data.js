// Soveriegn Quantum is a fictional company. People, roles and imagery come from the asset guide;
// dates, the campus and the milestone list are assumptions written for this demo.
// Basilisk 2 has no published qubit count or benchmark, by design.

export const COMPANY = {
  name: 'Soveriegn Quantum',
  campus: 'Harlow Fen Research Campus',
  address: ['Soveriegn Quantum', 'Building 4, Harlow Fen Research Campus', 'Cambridgeshire CB25 9QR', 'United Kingdom'],
  emails: {
    partnerships: 'partnerships@soveriegnquantum.com',
    careers: 'careers@soveriegnquantum.com',
    press: 'press@soveriegnquantum.com',
  },
};

export const PEOPLE = [
  {
    slug: 'celia-whitcombe',
    name: 'Dr. Celia Whitcombe',
    role: 'Co-founder and Chief Executive',
    image: 'dr-celia-whitcombe-cofounder-chief-executive',
    bio: 'Leads the company’s research strategy, engineering priorities, and institutional partnerships.',
  },
  {
    slug: 'rohan-dastur',
    name: 'Dr. Rohan Dastur',
    role: 'Co-founder and Chief Scientist',
    image: 'dr-rohan-dastur-chief-scientist',
    bio: 'Guides research into superconducting quantum systems, characterisation, and control.',
  },
  {
    slug: 'nadine-akinwale',
    name: 'Dr. Nadine Akinwale',
    role: 'Director of Quantum Hardware',
    image: 'dr-nadine-akinwale-director-quantum-hardware',
    bio: 'Leads the integration of quantum processors, control electronics, and measurement systems.',
  },
  {
    slug: 'leon-tseng',
    name: 'Dr. Leon Tseng',
    role: 'Principal Cryogenic Engineer',
    image: 'dr-leon-tseng-principal-cryogenic-engineer',
    bio: 'Develops the thermal, mechanical, and cryogenic infrastructure supporting the hardware program.',
  },
];

export const MOTIVE = {
  title: 'Why we build the whole machine',
  body: [
    'The problems quantum computers are expected to change first, new materials, the chemistry of batteries and fertiliser, the move to post-quantum cryptography, are the ones a country should not hand to a sealed box.',
    'So we design the processor, grow its junctions, wire the cryostat and write the control stack in one building. Every layer can be opened, measured and explained by the people who made it.',
  ],
};

export const PRINCIPLES = [
  {
    title: 'Each stage carries its own heat.',
    body: 'A dilution refrigerator works because no stage does another’s job. The 50 K stage stops the room, the 4 K stage stops the 50 K stage, and so on down to the mixing chamber. We organise the company the same way: small teams that each own one layer completely.',
  },
  {
    title: 'Measure before you claim.',
    body: 'We do not publish a qubit count, a coherence time or a gate fidelity until a laboratory outside our own has reproduced it. When Basilisk 2 has numbers, they will arrive with the data.',
  },
  {
    title: 'Build what you depend on.',
    body: 'If a part decides whether the machine works, we make it or we know how to: junctions, attenuators, cryogenic wiring, microwave packaging, control firmware.',
  },
];

// Two milestones ride on each cold stage as the camera descends past it.
export const STAGES = [
  { key: '4K', name: '4 K plate', temp: '4 K', note: 'Second pulse-tube stage. HEMT amplifiers and the first attenuators sit here.' },
  { key: 'Still', name: 'Still plate', temp: '0.8 K', note: 'Helium-3 is pumped from the still; its evaporation cools this plate.' },
  { key: 'Cold', name: 'Cold plate', temp: '0.1 K', note: 'Between the still and the mixing chamber; the continuous heat exchanger ends here.' },
  { key: 'MXC', name: 'Mixing chamber', temp: '10 mK', note: 'Helium-3 crosses into helium-4 and takes heat with it. The processor hangs below.' },
];

export const MILESTONES = [
  { year: '2019', title: 'Founded', body: 'Celia Whitcombe and Rohan Dastur start the company in a rented basement lab with one borrowed cryostat.' },
  { year: '2020', title: 'First cooldown on our own wiring', body: 'Every input line thermalised and attenuated at each stage by our own hands, and a full cooldown to base temperature.' },
  { year: '2021', title: 'Cleanroom commissioned', body: 'The first aluminium Josephson junctions grown on site by double-angle evaporation.' },
  { year: '2022', title: 'Basilisk 1 measured', body: 'Our first processor. It now teaches every new engineer how a qubit fails.' },
  { year: '2023', title: 'Harlow Fen', body: 'The company moves into its headquarters, with a measurement lab beside the cleanroom.' },
  { year: '2024', title: 'Two systems running', body: 'A second dilution refrigerator, and a control-electronics rack designed in-house.' },
  { year: '2025', title: 'Basilisk 2 packaged', body: 'Design finalised, dies diced, the first packages bonded and closed.' },
  { year: '2026', title: 'Basilisk 2 under characterisation', body: 'Measurements are under way. Numbers follow outside reproduction.' },
];

// The zoom into the processor: what is in view at each scale.
export const SCALES = [
  { key: 'package', scale: '60 mm', title: 'Basilisk 2', body: 'Our second superconducting processor, in a gold-plated copper package smaller than a playing card. The lid only comes off in a cleanroom. Here it comes off for you.' },
  { key: 'die', scale: '10 mm', title: 'The die', body: 'Ten millimetres of silicon under an aluminium film. Where the film is etched away the dark silicon shows through, and those lines are the circuit.' },
  { key: 'city', scale: '1 mm', title: 'A city of circuits', body: 'Laid out like a city and read like one: feedlines are the avenues, each cross is a transmon qubit, the meanders are readout resonators, and the small arches are airbridges tying the ground on both sides of a line together. Heights here are exaggerated ten times.' },
  { key: 'qubit', scale: '300 µm', title: 'One qubit, Q10', body: 'A cross of aluminium 330 µm wide. On its own it is only a capacitor. What makes it a qubit waits at the end of the lower arm.' },
  { key: 'squid', scale: '20 µm', title: 'The SQUID', body: 'Two Josephson junctions in a loop. Magnetic flux from the line beside it threads the loop and tunes the qubit’s frequency, a few gigahertz.' },
  { key: 'junction', scale: '0.2 µm', title: 'The junction', body: 'Two aluminium films overlap in a square 0.2 µm on a side, separated by about two nanometres of aluminium oxide. Cooper pairs tunnel through it, and that non-linear tunnelling is why the circuit can be a qubit. The faint strips beside it are shadows of the second evaporation angle.' },
];

// City labels: die coordinates in micrometres (origin at the die centre).
export const CITY_LABELS = [
  { at: [-800, 800, 4], text: 'Transmon qubit Q10', step: ['city'] },
  { at: [-800, 1250, 4], text: 'Readout resonator', step: ['city'] },
  { at: [-1600, 1600, 4], text: 'Feedline', step: ['city'] },
  { at: [0, 800, 4], text: 'Coupling bus', step: ['city'] },
  { at: [-766, 400, 4], text: 'Flux line', step: ['city', 'qubit'] },
  { at: [-905, 450, 4], text: 'Drive line', step: ['city', 'qubit'] },
  { at: [-800, 623, 3], text: 'SQUID', step: ['qubit'] },
  { at: [-807, 621.6, 1.2], text: 'Al / AlOx / Al junction', step: ['squid'] },
  { at: [-793, 621.6, 1.2], text: 'Second junction', step: ['squid'] },
];

export const BASILISK_FACTS = [
  ['Package', 'Gold-plated oxygen-free copper, 60 × 45 × 12 mm, two SMA and ten SMP launches'],
  ['Die', '10 × 10 mm silicon, aluminium ground plane with flux-trapping holes'],
  ['Qubits', 'Fixed-frequency-capable transmons with SQUID tuning; count withheld until reproduced'],
  ['Junctions', 'Al / AlOx / Al, double-angle shadow evaporation, overlap about 0.2 × 0.2 µm'],
  ['Readout', 'λ/4 coplanar-waveguide resonators on shared feedlines'],
  ['Operating stage', 'Below the mixing chamber, about 10 mK, inside a magnetic shield'],
  ['Coherence, gate fidelity', 'Under characterisation'],
];

export const FACILITIES = [
  { image: 'headquarters-revised', title: 'Headquarters', body: 'Building 4 at Harlow Fen: offices, the measurement lab and the cleanroom under one roof, so a die can go from evaporation to cooldown without leaving the building.' },
  { image: 'fabrication-cleanroom', title: 'Cleanroom', body: 'Lithography, aluminium evaporation and oxidation for junctions, dicing and inspection.' },
  { image: 'basilisk-2-wafer-inspection', title: 'Wafer inspection', body: 'Every wafer is mapped under the microscope before a single die is diced.' },
  { image: 'measurement-lab', title: 'Measurement lab', body: 'Room-temperature electronics, cryostat control and the people who read the data.' },
  { image: 'dual-system-installation', title: 'Two systems', body: 'Two dilution refrigerators run side by side so one can be warmed and rewired while the other measures.' },
  { image: 'cryogenic-systems', title: 'Cryogenic plant', body: 'Pulse-tube compressors, gas-handling and helium recovery.' },
  { image: 'control-electronics', title: 'Control electronics', body: 'Microwave sources, digitisers and the rack we designed to drive Basilisk 2.' },
  { image: 'data-center', title: 'Data centre', body: 'Classical compute for calibration, simulation and the archive of every measurement we have taken.' },
];
