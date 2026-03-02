import { GenericStore } from '$lib/store/genericStore.svelte';
import { loadDB } from './db';

export const dbStore = new GenericStore(loadDB);
