import Fraction from 'fraction.js';

const simplifyMap: Record<string, string> = {
  'gtceu:large_chemical_reactor/sulfuric_acid_from_trioxide': 'H2SO4',
  'gtceu:large_chemical_reactor/sulfur_trioxide': 'SO3',
  'gtceu:large_chemical_reactor/sulfur_dioxide_from_sulfur': 'SO2',
  'gtceu:electrolyzer/water_electrolysis': 'O2',
};

type SBArg = number | string | Fraction | boolean;

type SRMapArg = Map<string, SRArg>;
type SRRecordArgs = Record<string, SBArg>;
type SRArrayArg = SBArg[];
type SRArg = SBArg | SRMapArg | SRRecordArgs | SRArrayArg;

export function sr(input: SRArg): unknown {
  if (typeof input === 'string') return simplifyMap[input] ?? input;
  if (typeof input === 'number' || typeof input === 'boolean') return input;
  if (input instanceof Fraction) {
    return input.toString();
  }
  if (input instanceof Map) {
    const o = Object.fromEntries(input.entries().map(([key, value]) => [sr(key), sr(value)]));
    return o;
  }
  if (Array.isArray(input)) {
    const o = input.map(sr);
    return o;
  }
  if (typeof input === 'object') {
    const o = Object.fromEntries(Object.entries(input).map(([key, value]) => [sr(key), sr(value)]));
    return o;
  }
  throw Error(`Unknown input: ${input}`);
}

export function srlog(msg: string, input: SRArg) {
  const s = sr(input);
  if (typeof s === 'string') {
    console.log(msg, s);
  }
  console.log(msg);
  console.table(s);
}
