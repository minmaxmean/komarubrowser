import type { KyselyDB } from '@komarubrowser/common/db/database';
import type { Manifest } from '@komarubrowser/common/db/manifest';

export class ManifestRepo {
  constructor(private db: KyselyDB) {}
  async all(): Promise<Manifest[]> {
    let query = this.db.selectFrom('manifest');
    return await query.selectAll().execute();
  }
}
