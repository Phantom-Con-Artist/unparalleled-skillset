// Forms, glazes and finishes offered on the commission desk.
// Half-profiles (radius, height) in metres, rim last. Each one is spun on a virtual wheel.
export const FORMS = {
  amphora: { label: 'Amphora', pts: [[0.07, 0], [0.075, 0.01], [0.07, 0.025], [0.12, 0.08], [0.17, 0.17], [0.18, 0.24], [0.16, 0.32], [0.1, 0.39], [0.06, 0.43], [0.055, 0.47], [0.065, 0.5]] },
  moon: { label: 'Moon jar', pts: [[0.08, 0], [0.085, 0.01], [0.09, 0.03], [0.17, 0.09], [0.21, 0.17], [0.2, 0.25], [0.15, 0.32], [0.09, 0.355], [0.085, 0.37], [0.09, 0.38]] },
  bottle: { label: 'Fluted bottle', pts: [[0.075, 0], [0.08, 0.01], [0.085, 0.03], [0.11, 0.12], [0.125, 0.22], [0.115, 0.32], [0.08, 0.41], [0.045, 0.47], [0.04, 0.52], [0.05, 0.56]] },
  lidded: { label: 'Lidded jar', pts: [[0.09, 0], [0.095, 0.01], [0.1, 0.03], [0.16, 0.1], [0.18, 0.18], [0.165, 0.26], [0.12, 0.31], [0.115, 0.33], [0.12, 0.34], [0.09, 0.37], [0.03, 0.4], [0.025, 0.42], [0.03, 0.44]] },
};

export const GLAZES = {
  celadon: { label: 'Celadon', color: '#9fae95', rough: 0.28 },
  cobalt: { label: 'Cobalt', color: '#22306a', rough: 0.18 },
  oxblood: { label: 'Oxblood', color: '#6a1a14', rough: 0.16 },
  ivory: { label: 'Ivory', color: '#e8dfcc', rough: 0.4 },
  rose: { label: 'Rose', color: '#c99385', rough: 0.35 },
  teal: { label: 'Teal', color: '#2c5f63', rough: 0.22 },
  glacier: { label: 'Glacier', color: '#d6dee2', rough: 0.55 },
  black: { label: 'Black', color: '#1c1814', rough: 0.14 },
};

export const GOLD = { none: 'None', lip: 'A gold lip', bands: 'Gilt bands' };
export const HEIGHTS = { table: ['Table, under 30 cm', 0.62], console: ['Console, 30 to 50 cm', 0.85], floor: ['Floor, over 50 cm', 1.08] };
