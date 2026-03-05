import initSqlJs from 'sql.js';
import { SqlJsDialect } from 'kysely-wasm';
import { getDb } from '@komarubrowser/common/db/database.js';
import { GenericStore } from '$lib/store/genericStore.svelte';
import { assets } from '$lib/assets';
import type { GlobalFilter } from './globalFilter';
import { IngredientRepo } from './ingredientRepo';
import { ManifestRepo } from './manifestRepo';
import { RecipeRepo } from './recipeRepo';
import { RecipeCategoryRepo } from './recipeCategoryRepo';

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

export type SuperRepo = {
  ingredients: IngredientRepo;
  manifest: ManifestRepo;
  recipe: RecipeRepo;
  recipeCategory: RecipeCategoryRepo;
  close: () => Promise<void>;
};

export const loadDB = async (): Promise<SuperRepo> => {
  const sqlPromise = initSqlJs({ locateFile: () => assets.SQLITE_WASM });
  const dataPromise = fetch(assets.ASSETS_DB).then((res) => res.arrayBuffer());
  const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
  const db = getDb(new SqlJsDialect({ database: new SQL.Database(new Uint8Array(buf)) }));
  console.log({ db });

  return {
    ingredients: new IngredientRepo(db, globalFilter),
    manifest: new ManifestRepo(db),
    recipe: new RecipeRepo(db),
    recipeCategory: new RecipeCategoryRepo(db),
    close: () => db.destroy(),
  };
};

export const dbStore = new GenericStore(loadDB);
