import type { FetchStatus } from "../../../../common/types";

export type Fetcher<T> = () => Promise<T>;

export class GenericStore<T> {
	public data = $state<T | null>(null);
	public status = $state<FetchStatus>('idle');
  constructor(private fetcher: Fetcher<T>) { }
	async fetch(): Promise<T|null> {
		if (this.data !== null) {
			return this.data;
		}
		this.status = 'loading';
		try {
			this.data = await this.fetcher();
			this.status = 'successful';
		} catch (e: any) {
			console.error(e);
			this.status = 'error';
		}
    return this.data;
	}
}

