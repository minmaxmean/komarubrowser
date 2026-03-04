import { GenericStore } from '$lib/store/genericStore.svelte';
import { assets } from '$lib/assets';
import initSqlJs from 'sql.js';
import { getSuperRepo, type SuperRepo } from '@komarubrowser/common/db/repo.js';
import { type GlobalFilter } from '@komarubrowser/common/db/globalFilter.js';
import { SqlJsDialect } from 'kysely-wasm';

export const defaultGlobalFilter: GlobalFilter = {
  ingredient: {
    namespace: [
      'architects_palette',
      'createdieselgenerators',
      'vintage',
      'chipped',
      'chisel_chipped_integration',
      'create',
      'dustrial_decor',
      'rechiseled',
      'xycraft_world',
      'xtonesreworked',
      'fantasyfurniture',
      'rechiseledcreate',
      'framedblocks',
      'thermal',
    ],
    idLike: ['%_flowing', '%:flowing_%', '%_bucket', '%_axe', '%_paxel', '%_sword', '%_shovel'],
    displayNameLike: [],
  },
};

export const globalFilter = $state<GlobalFilter>(defaultGlobalFilter);

export const loadDB = async (): Promise<SuperRepo> => {
  const sqlPromise = initSqlJs({
    locateFile: () => assets.SQLITE_WASM,
  });
  const dataPromise = fetch(assets.ASSETS_DB).then((res) => res.arrayBuffer());
  const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
  const db = new SQL.Database(new Uint8Array(buf));

  const dialect = new SqlJsDialect({ database: db });
  return getSuperRepo(dialect, () => globalFilter);
};

export const dbStore = new GenericStore(loadDB);
