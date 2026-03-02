import type { FetchStatus } from "../../../../common/types";

const DB_URL = '/assets/assets.db';

class DbStore {
	public data = $state<Blob | null>(null);
	public status = $state<FetchStatus>('idle');
	async fetch() {
		if (this.data !== null) {
			return;
		}
		this.status = 'loading';
		try {
			const resp = await fetch(DB_URL);
			this.data = await resp.blob();
			this.status = 'successful';
		} catch (e: any) {
			console.error(e);
			this.status = 'error';
		}
	}
}

export const dbStore = new DbStore();
