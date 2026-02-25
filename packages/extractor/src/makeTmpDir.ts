import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { mkdirp } from "./utils";

// Will make temp directory at /tmp/komaru/{command}_<random_hashjf>

export const makeTmpDir = async (command: string): Promise<string> => {
  await mkdirp(os.tmpdir(), "komaru");
  return await fs.mkdtemp(path.join(os.tmpdir(), "komaru", command + "_"));
};
