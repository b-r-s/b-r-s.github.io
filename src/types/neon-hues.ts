export const NeonColors = {
  Pink: 'pink',
  Green: 'green',
  Blue: 'blue',
  Purple: 'purple',
  Gold: 'gold',
  Cyan: 'cyan'
} as const;

export type NeonColor = typeof NeonColors[keyof typeof NeonColors];

export const NeonHueValues: Record<NeonColor, number> = {
  [NeonColors.Pink]: 328,
  [NeonColors.Green]: 120,
  [NeonColors.Blue]: 220,
  [NeonColors.Purple]: 305,
  [NeonColors.Gold]: 45,
  [NeonColors.Cyan]: 180
};
