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

export const readJson = async <T>(filepath: string): Promise<T> => {
  const json = await fs.readFile(filepath, "utf-8");
  const data = JSON.parse(json);
  return data;
};

export const safeCopy = async (src: string, dest: string): Promise<void> => {
  await mkdirp(path.dirname(dest));
  await fs.copyFile(src, dest);
};
