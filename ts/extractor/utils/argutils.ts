type Args<T extends string> = Record<T, string>;
type PartialArgs<T extends string> = Partial<Args<T>>;

export function parseArgs<T extends string>(requiredArgs: readonly T[]): Args<T> {
  const args = process.argv.slice(2);
  const parsed: PartialArgs<T> = {};
  console.log("args:", args);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const nextArg = args[i + 1];
      if (!nextArg || nextArg.startsWith("--")) {
        throw new Error(`Missing value for argument: ${arg}`);
      }
      const key = arg.slice(2) as T;
      if (!requiredArgs.includes(key as any)) {
        throw new Error(`Unknonw arguments: ${key}`);
      }
      parsed[key] = nextArg;
      i++;
    }
  }

  for (const key of requiredArgs) {
    if (!parsed[key]) {
      throw new Error(`Missing required argument: --${key}`);
    }
  }

  return parsed as Args<T>;
}
