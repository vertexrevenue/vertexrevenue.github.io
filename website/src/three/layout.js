/* Shared palette for the 3D world: charcoal, silver, white, midnight cobalt spark. */
export const C = {
  charcoal: "#0c0d10",
  panel: "#15171c",
  silver: "#c4c8d0",
  silverDim: "#7d828c",
  white: "#f4f5f7",
  cobalt: "#2f4bff",
  spark: "#5b77ff",
  midnight: "#0b1748",
};

/* Story timeline, as fractions of the pinned story section. */
export const T = {
  enter: [0.0, 0.12],
  turn: [0.12, 0.3],
  flap: [0.3, 0.46],
  rise: [0.46, 0.62],
  drop: [0.62, 0.76],
  flip: [0.76, 0.86],
  spark: [0.86, 0.92],
  graph: [0.9, 1.0],
  scans: [[0.16, 0.28], [0.32, 0.44], [0.5, 0.6], [0.64, 0.74]],
};

/* Step thresholds for the text column (7 steps). */
export const STEP_AT = [0, 0.12, 0.3, 0.46, 0.62, 0.76, 0.86];
export const stepFor = (p) => {
  let s = 0;
  STEP_AT.forEach((a, i) => { if (p >= a) s = i; });
  return s;
};

export const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
export const seg = (p, [a, b]) => clamp01((p - a) / (b - a));
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
