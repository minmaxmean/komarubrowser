import { assets } from '$lib/assets';
import initSqlJs from 'sql.js';
import { getSuperRepo, type SuperRepo } from '@komarubrowser/common/db/init';
import { SqlJsDialect } from 'kysely-wasm';

export const loadDB = async (): Promise<SuperRepo> => {
  const sqlPromise = initSqlJs({
    locateFile: () => assets.SQLITE_WASM
  });
  const dataPromise = fetch(assets.ASSETS_DB).then((res) => res.arrayBuffer());
  const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
  const db = new SQL.Database(new Uint8Array(buf));

  const dialect = new SqlJsDialect({ database: db });
  return getSuperRepo(dialect);
};
