export type ManifestItem = {
	filename: string;
	width: number;
	height: number;
	jar: string;
	mod: string;
	type: string;
};

export type Manifest = ManifestItem[];
