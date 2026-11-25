export type Shot = {
  n: number; // 1..12
  scene: string;
  camera: string;
  dialogue: string; // verbatim line, or "" for silent shots
  narration: string;
  visualPrompt: string; // English image prompt
  mood: string;
  seconds: number; // 5..15
};

export const MIN_CHARS = 500;
export const MAX_CHARS = 5000;