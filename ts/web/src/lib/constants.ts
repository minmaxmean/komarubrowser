import Fraction from 'fraction.js';

export const FULL_CHANCE = 100_00;

export const applyChance = (val: Fraction, c?: number): Fraction => {
  if (!c || c === FULL_CHANCE) {
    return val;
  }
  return val.mul(c).div(FULL_CHANCE);
};
