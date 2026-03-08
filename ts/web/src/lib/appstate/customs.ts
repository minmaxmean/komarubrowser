import type Fraction from 'fraction.js';

export type MachineCustomization = { cnt: Fraction };

export type Customs = Partial<Record<string, MachineCustomization>>;
