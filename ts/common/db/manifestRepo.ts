import { KyselyDB } from "./database.js";
import { Manifest, NewManifest } from "./manifest.js";

export class ManifestRepo {
  constructor(private db: KyselyDB) {}
  async allWithIcons(): Promise<Manifest[]> {
    let query = this.db.selectFrom("manifest");
    return await query.selectAll().execute();
  }
  async insertMany(items: NewManifest[]): Promise<void> {
    const chunkSize = 500;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      await this.db.insertInto("manifest").values(chunk).execute();
    }
  }
}
