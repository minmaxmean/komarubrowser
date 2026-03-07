import type Fraction from 'fraction.js';

type AmountUnit = {
  amount: Fraction;
  unit: string;
};

const TICKS_PER_SEC = 20;

export const calcUnit = (
  isFluid: boolean,
  amount: Fraction,
  useBuckets: boolean = false,
): AmountUnit => {
  amount = amount.mul(TICKS_PER_SEC);
  if (!isFluid) {
    return { amount, unit: '' };
  }
  if (useBuckets) {
    return { amount: amount.div(1000), unit: 'b' };
  }
  return { amount, unit: 'mb' };
};
