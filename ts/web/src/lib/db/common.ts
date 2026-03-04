import { sql, type SelectQueryBuilder } from 'kysely';
import type { Database, KyselyDB } from '@komarubrowser/common/db/database.js';

export type Pagination = {
  offset: number;
  limit: number;
};

type SelectQuery<T extends keyof Database> = SelectQueryBuilder<Database, T, {}>;

export const applyPagination = <T extends keyof Database>(
  query: SelectQuery<T>,
  pagination: Pagination,
): SelectQuery<T> => {
  return query.offset(pagination.offset).limit(pagination.limit);
};

export const explain = async (db: KyselyDB, query: SelectQueryBuilder<Database, any, any>) => {
  const raw_sql = query.compile().sql;
  console.log('QUERY', raw_sql);
  const explain = await sql<{ detail: string }>`EXPLAIN QUERY PLAN ${sql.raw(raw_sql)}`.execute(db);
  console.log('EXPLAIN', explain.rows.map((r) => r.detail).join('\n'));
};
