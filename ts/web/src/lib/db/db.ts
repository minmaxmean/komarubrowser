import { assets } from '$lib/assets';
import initSqlJs from 'sql.js'
import type { Database } from 'sql.js'

export const loadDB = async (): Promise<Database> => {
  const sqlPromise = initSqlJs({
    locateFile: () => assets.SQLITE_WASM,
  });
  const dataPromise = fetch(assets.ASSETS_DB).then(res => res.arrayBuffer())
  const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
  const db = new SQL.Database(new Uint8Array(buf));
  return db
} 
