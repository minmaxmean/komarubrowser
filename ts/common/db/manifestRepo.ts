import type { KyselyDB } from "./database.js";
import type { Manifest } from "./manifest.js";

export class ManifestRepo {
  constructor(private db: KyselyDB) {}
  async all(): Promise<Manifest[]> {
    let query = this.db.selectFrom("manifest");
    return await query.selectAll().execute();
  }
}
