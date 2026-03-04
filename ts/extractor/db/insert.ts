import { Database, KyselyDB } from "@komarubrowser/common/db/database.js";
import { Insertable } from "kysely";

const insertMany = async <T extends keyof Database>(
  db: KyselyDB,
  table: T,
  items: Insertable<Database[T]>[],
): Promise<void> => {
  const chunkSize = 500;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await db.insertInto(table).values(chunk).execute();
  }
};
