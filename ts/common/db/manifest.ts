import type { Insertable, Selectable } from "kysely";

export type ManifestTable = {
  filepath: string;
  width: number;
  height: number;
};

export type Manifest = Selectable<ManifestTable>;
export type NewManifest = Insertable<ManifestTable>;
