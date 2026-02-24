import "./shared.js";
import { extractAssets } from "./extract.js";
import { buildManifest } from "./manifest.js";
import { minifyJson } from "./minify.js";

const args = process.argv.slice(2);

async function main(): Promise<void> {
  if (args.includes("--extract")) {
    await extractAssets();
    await buildManifest();
    return;
  }
  if (args.includes("--minify")) {
    await minifyJson();
    return;
  }
  await extractAssets();
  await buildManifest();
}

await main();
