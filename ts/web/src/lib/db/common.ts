import { sql, type SelectQueryBuilder } from 'kysely';
import type { Database, KyselyDB } from '@komarubrowser/common/db/database.js';

export type Pagination = {
  offset: number;
  limit: number;
};

export const applyPagination = <D, T extends keyof D, O>(
  query: SelectQueryBuilder<D, T, O>,
  pagination: Pagination,
): SelectQueryBuilder<D, T, O> => {
  return query.offset(pagination.offset).limit(pagination.limit);
};

export const explain = async (db: KyselyDB, query: SelectQueryBuilder<Database, any, any>) => {
  const raw_sql = query.compile();
  console.log('QUERY', raw_sql.sql, raw_sql.parameters);
  const explain = await sql<{ detail: string }>`EXPLAIN QUERY PLAN ${sql.raw(raw_sql.sql)}`.execute(
    db,
  );
  console.log(`EXPLAIN QUERY PLAN:\n${explain.rows.map((r) => r.detail).join('\n')}`);
};
