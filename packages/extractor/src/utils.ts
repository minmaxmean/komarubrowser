import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

// Will make temp directory at /tmp/komaru/{command}_<random_hashjf>
export const makeTmpDir = async (command: string): Promise<string> => {
  await fs.mkdir(path.join(os.tmpdir(), "komaru"), { recursive: true });
  return await fs.mkdtemp(path.join(os.tmpdir(), "komaru", command + "_"));
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
  if (await pathExists(dir)) {
    await fs.rm(dir, { recursive: true });
  }
  await fs.mkdir(dir, { recursive: true });
  return dir;
};

export async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
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
  await fs.mkdir(path.dirname(dest), { recursive: true });
  try {
    // Try simple rename first
    await fs.rename(src, dest);
  } catch (err: any) {
    if (err.code === "EXDEV") {
      // Cross-device link, fallback to copy + delete
      const stat = await fs.stat(src);
      if (stat.isDirectory()) {
        await copyDir(src, dest);
        await fs.rm(src, { recursive: true });
      } else {
        await fs.copyFile(src, dest);
        await fs.unlink(src);
      }
    } else {
      throw err;
    }
  }
}

export const rmrf = async (dir: string): Promise<string> => {
  if (await pathExists(dir)) {
    await fs.unlink(dir);
  }
  return dir;
};
