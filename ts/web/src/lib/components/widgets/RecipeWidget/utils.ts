import type { Ingredient } from '@komarubrowser/common/db/ingredient';
import type { Recipe } from '@komarubrowser/common/db/recipe';

export const getDisplayName = (id: string, map?: Map<string, Ingredient>) => {
  let item = map?.get(id);
  if (item?.display_name) {
    return item.display_name;
  }
  return fakeDisplayName(id);
};

export const fakeDisplayName = (id: string): string => {
  let splits = id.split('/');
  id = splits[splits.length - 1];
  splits = id.split(':');
  id = splits[splits.length - 1];
  id = id.replaceAll('_', ' ');
  return id;
};

export const getItemIds = (r: Recipe): string[] => {
  return [r.machine].concat(
    r.inputs.map((i) => i.accepted_ids[0]),
    r.outputs.map((i) => i.accepted_ids[0]),
  );
};

type AmountUnit = {
  amount: number;
  unit: string;
};

export const calcUnit = (
  isFluid: boolean,
  amount: number,
  useBuckets: boolean = false,
): AmountUnit => {
  if (!isFluid) {
    return { amount, unit: '' };
  }
  if (useBuckets) {
    return { amount: amount / 1000, unit: 'b' };
  }
  return { amount: amount, unit: 'mb' };
};
