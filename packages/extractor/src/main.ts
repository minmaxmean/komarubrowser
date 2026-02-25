import { extractPngs } from "./extract.js";
import { minifyJson } from "./minify.js";
import { buildDb } from "./build-db.js";
import { getJarEnv } from "./shared.js";

const args = process.argv.slice(2);

async function main(): Promise<void> {
  if (args.includes("--extract-pngs")) {
    const args = getJarEnv();
    console.log("Running --extract-pngs with ", args);
    await extractPngs(args);
    return;
  } else if (args.includes("--build-db")) {
    await buildDb();
    return;
  } else if (args.includes("--minify")) {
    await minifyJson();
    return;
  } else {
    console.log("provide --extract|--build-db|--minify");
    process.exit(1);
  }
}

await main();
