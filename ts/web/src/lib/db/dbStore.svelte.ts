import { GenericStore } from "$lib/store/store.svelte";
import { loadDB } from "./db";

export const dbStore = new GenericStore(loadDB);
