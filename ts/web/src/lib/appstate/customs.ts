import type Fraction from 'fraction.js';
import type { EnergyTierID } from '@komarubrowser/common/db/energyTier';

export type MachineCustomization = {
  isAuto: boolean;
  cnt?: Fraction;
  energyTier?: EnergyTierID;
  hasPerfectOC?: boolean;
};

export const defaultCustomization: MachineCustomization = {
  isAuto: true,
};

export type Customs = Partial<Record<string, MachineCustomization>>;

export type CustomsMap = Map<string, MachineCustomization>;
