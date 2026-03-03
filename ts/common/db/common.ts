import { SelectQueryBuilder } from "kysely";
import { Database } from "./database.js";

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
