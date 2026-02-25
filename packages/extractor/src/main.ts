import { extractPngs } from "./extract.js";
import { minifyJson } from "./minify.js";
import { getBuildDBArgs, getExtractPngsArgs } from "./args.js";
import { buildDb } from "./build-db.js";

const args = process.argv.slice(2);

async function main(): Promise<void> {
  if (args.includes("--extract-pngs")) {
    const args = getExtractPngsArgs();
    console.log("Running --extract-pngs with ", args);
    await extractPngs(args);
    return;
  } else if (args.includes("--build-db")) {
    const args = getBuildDBArgs();
    await buildDb(args);
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
