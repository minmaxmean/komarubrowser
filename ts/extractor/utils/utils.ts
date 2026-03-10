import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

export const mkdirp = async (...parts: string[]): Promise<string> => {
  const fullpath = path.join(...parts);
  await fs.mkdir(fullpath, { recursive: true });
  return fullpath;
};

// Will make temp directory at /tmp/komaru/{command}_<random_hashjf>
export const makeTmpDir = async (command: string): Promise<string> => {
  const fullpath = path.join(os.tmpdir(), "komaru", command + "_");
  await mkdirp(path.dirname(fullpath));
  return await fs.mkdtemp(fullpath);
};

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export const recreateDir = async (dir: string): Promise<string> => {
  await rmrf(dir);
  return mkdirp(dir);
};

export async function copyDir(src: string, dest: string): Promise<void> {
  await mkdirp(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export async function atomicMove(src: string, dest: string): Promise<void> {
  await mkdirp(path.dirname(dest));
  try {
    // Try simple rename first
    await fs.rename(src, dest);
  } catch (err: any) {
    if (err.code !== "EXDEV") {
      throw err;
    }
    // Cross-device link, fallback to copy + delete
    const stat = await fs.stat(src);
    if (stat.isDirectory()) {
      await copyDir(src, dest);
      await rmrf(src);
    } else {
      await fs.copyFile(src, dest);
      await fs.unlink(src);
    }
  }
}

export const rmrf = async (dir: string): Promise<string> => {
  await fs.rm(dir, { recursive: true, force: true });
  return dir;
};

export const writeJson = async <T>(filepath: string, data: T): Promise<void> => {
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(filepath, json, "utf-8");
};

export const safeCopy = async (src: string, dest: string): Promise<void> => {
  dest = dest.toLowerCase();
  await mkdirp(path.dirname(dest));
  await fs.copyFile(src, dest);
};

export const SKIPPED_JARS = new Set([
  "client-1.20.1-20230612.114412-srg.jar",

  "Architects-Palette-1.20.1-1.3.6.1.jar",
  "ChippedExpress-universal-20x.jar",
  "MysticalAgriculture-1.20.1-7.0.23.jar",
  "XyCraft Core-0.6.22.jar",
  "XyCraft World-0.6.22.jar",
  "buildinggadgets2-1.0.8.jar",
  "chipped-forge-1.20.1-3.0.7.jar",
  "chisel_chipped_integration-v1.1.6-1.20.1.jar",
  "cofh_core-1.20.1-11.0.2.56.jar",
  "create-new-age-forge-1.20.1-1.1.4.jar",
  "createdieselgenerators-1.20.1-1.3.5.jar",
  "createlowheated-forge-1.20.1-6.0.6-4.jar",
  "rechiseled-1.1.6-forge-mc1.20.jar",
  "xtonesreworked-1.0.4-F_1.20.1-47.2.0.jar",
  //  "ThermalExtra-3.3.0-1.20.1.jar",
  //  "create-1.20.1-6.0.8.jar",
  //  "thermal_foundation-1.20.1-11.0.6.70.jar",
]);
