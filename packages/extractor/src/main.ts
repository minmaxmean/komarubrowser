import "./shared.js";
import { extractAssets } from "./extract.js";
import { buildManifest } from "./manifest.js";
import { minifyJson } from "./minify.js";

const args = process.argv.slice(2);

async function main(): Promise<void> {
  if (args.includes("--extract")) {
    await extractAssets();
    return;
  } else if (args.includes("--build-manifest")) {
    await buildManifest();
    return;
  } else if (args.includes("--minify")) {
    await minifyJson();
    return;
  } else {
    console.log("provide --extract|--build-manifest|--minify");
    process.exit(1);
  }
}

await main();
