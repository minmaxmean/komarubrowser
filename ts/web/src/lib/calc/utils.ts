const simplifyMap: Record<string, string> = {
  'gtceu:large_chemical_reactor/sulfuric_acid_from_trioxide': 'H2SO4',
  'gtceu:large_chemical_reactor/sulfur_trioxide': 'SO3',
  'gtceu:large_chemical_reactor/sulfur_dioxide_from_sulfur': 'SO2',
  'gtceu:electrolyzer/water_electrolysis': 'O2',
};

export function s<T>(id: Map<string, T>): Record<string, T>;
export function s(id: string[]): string[];
export function s(id: string): string;
export function s(
  input: string | string[] | Map<string, unknown>,
): string | string[] | Record<string, unknown> {
  if (typeof input === 'string') return simplifyMap[input] ?? input;
  if (Array.isArray(input)) return input.map((item) => s(item));
  if (input instanceof Map)
    return Object.fromEntries(input.entries().map(([key, values]) => [s(key), values]));
  throw Error(`Unknown input: ${input}`);
}
