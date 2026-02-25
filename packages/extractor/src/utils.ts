import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

// Will make temp directory at /tmp/komaru/{command}_<random_hashjf>
export const makeTmpDir = async (command: string): Promise<string> => {
  await fs.mkdir(path.join(os.tmpdir(), "komaru"));
  return await fs.mkdtemp(path.join(os.tmpdir(), "komaru", command + "_"));
};
