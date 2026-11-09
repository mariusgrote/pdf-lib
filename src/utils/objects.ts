import { FontNames } from '../packages/standard-fonts/index';

export const values = <T>(obj: Record<string, T>) =>
  Object.keys(obj).map((k) => obj[k]);

export const StandardFontValues = values(FontNames);

export const isStandardFont = (input: unknown): input is FontNames =>
  StandardFontValues.includes(input as FontNames);

export const rectanglesAreEqual = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
