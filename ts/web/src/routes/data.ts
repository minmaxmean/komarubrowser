import type { Recipe } from '@komarubrowser/common/db/recipe';

export const mockRecipies: Recipe[] = [
  {
    id: 'gtceu:distillation_tower/distill_liquid_nether_air',
    machine: 'gtceu:distillation_tower',
    inputs: [
      { accepted_ids: ['gtceu:liquid_nether_air'], amount: 100000, chance: 10000, perTick: false }
    ],
    outputs: [
      { accepted_ids: ['gtceu:ash_dust'], amount: 1, chance: 2250, perTick: false },
      { accepted_ids: ['gtceu:carbon_monoxide'], amount: 72000, chance: 10000, perTick: false },
      { accepted_ids: ['gtceu:coal_gas'], amount: 10000, chance: 10000, perTick: false },
      { accepted_ids: ['gtceu:hydrogen_sulfide'], amount: 7500, chance: 10000, perTick: false },
      { accepted_ids: ['gtceu:sulfur_dioxide'], amount: 7500, chance: 10000, perTick: false },
      { accepted_ids: ['gtceu:helium_3'], amount: 2500, chance: 10000, perTick: false },
      { accepted_ids: ['gtceu:neon'], amount: 500, chance: 10000, perTick: false }
    ],
    duration: 2000,
    min_tier: 4,
    eut_consumed: 1920,
    eut_produced: 0
  },
  {
    id: 'gtceu:vacuum_freezer/liquid_nether_air',
    machine: 'gtceu:vacuum_freezer',
    inputs: [{ accepted_ids: ['gtceu:nether_air'], amount: 4000, chance: 10000, perTick: false }],
    outputs: [
      { accepted_ids: ['gtceu:liquid_nether_air'], amount: 4000, chance: 10000, perTick: false }
    ],
    duration: 80,
    min_tier: 4,
    eut_consumed: 1920,
    eut_produced: 0
  }
];
