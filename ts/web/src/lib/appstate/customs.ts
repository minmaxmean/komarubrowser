import Fraction from 'fraction.js';
import type { EnergyTierID } from '@komarubrowser/common/db/energyTier.js';

export type MachineCust = {
  isAuto: boolean;
  cnt?: Fraction;
  energyTier?: EnergyTierID;
  hasPerfectOC?: boolean;
};

export type MachineCustKey = keyof MachineCust;

export type MachineCustGetter<T extends keyof MachineCust> = (nodeId: string) => MachineCust[T];
export type MachineCustSetter<T extends keyof MachineCust> = (
  nodeId: string,
  val: MachineCust[T],
) => void;

export const defaultCustomization: MachineCust = {
  isAuto: true,
  cnt: new Fraction(1),
};

export type Customs = Partial<Record<string, MachineCust>>;

export type CustomsMap = Map<string, MachineCust>;
