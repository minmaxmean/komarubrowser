import type Fraction from 'fraction.js';

type AmountUnit = {
  amount: string;
  unit: string;
};

const TICKS_PER_SEC = 20;
const DECIMAL_PLACES = 3;

export const calcUnit = (
  isFluid: boolean,
  amount: Fraction,
  useBuckets: boolean = false,
): AmountUnit => {
  amount = amount.mul(TICKS_PER_SEC);
  let unit = '';
  if (isFluid) {
    if (useBuckets) {
      amount = amount.div(1000);
      unit = 'b';
    } else {
      unit = 'mb';
    }
  }
  return { amount: amount.valueOf().toFixed(DECIMAL_PLACES), unit };
};
