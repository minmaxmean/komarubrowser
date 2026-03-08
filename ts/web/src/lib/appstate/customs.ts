import type Fraction from 'fraction.js';
import type { EnergyTierID } from '@komarubrowser/common/db/energyTier';

export type MachineCustomization = {
  cnt: Fraction;
  energyTier: EnergyTierID;
};

export type Customs = Partial<Record<string, MachineCustomization>>;
