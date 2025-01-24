import {
  and,
  eq,
  getTableColumns,
  or,
  sql,
  type SQL,
  type TableConfig,
} from "drizzle-orm";
import {consola} from "consola";
import { PgTable, QueryBuilder } from "drizzle-orm/pg-core";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

type JoinStrategy = "AND" | "OR";
/**
 * Creates SQL query conditions for a database table using different strategies.
 *
 * @template T - Type extending TableConfig defining the table structure
 *
 * @description
 * This function has multiple overloads:
 * 1. Creates a new query builder instance
 * 2. Creates SQL conditions from an object of field values
 * 3. Combines multiple query objects with inner joins
 *
 * @param {TableWithColumns<T>} table - The database table to query
 * @param {Partial<TableWithFields<T>> | _Q<T>[]} rest - Either:
 *   - Nothing: Returns a new query builder
 *   - Object: Field values to match against
 *   - Array of query conditions to combine
 * @param {JoinStrategy} [strategy='AND'] - How to join multiple conditions:
 *   - 'AND': All conditions must match (default)
 *   - 'OR': Any condition can match
 *
 * @returns {_Q<T> | SQL} Either a query builder instance or SQL conditions
 *
 * @example
 * // Create query builder
 * const query = q(usersTable);
 *
 * @example
 * // Match field values
 * const activeUsers = q(usersTable, {
 *   active: true,
 *   type: 'customer'
 * });
 *
 * @example
 * // OR conditions
 * const specialUsers = q(usersTable, {
 *   type: 'admin',
 *   role: 'manager'
 * }, 'OR');
 *
 * const someShit = q(tableA, {size: "large", gender: "male"}, "OR")
 * const otherShit = q(tableA, {size: "not large", gender: "peacock"})
 * const shit = q(someShit, otheShit)
 */
function q<T extends TableConfig>(table: TableWithColumns<T>): _Q<T>;
function q<T extends TableConfig>(
  table: TableWithColumns<T>,
  data: Partial<TableWithFields<T>> | _Q<T>,
  strategy?: JoinStrategy
): SQL;
function q<T extends TableConfig>(...args: _Q<T>[]): SQL;
function q<T extends TableConfig>(
  ...args: OneOf<
    [
      Array<_Q<T>>,
      [
        table: TableWithColumns<T>,
        data?: Partial<TableWithFields<T>> | _Q<T>,
        strategy?: JoinStrategy
      ]
    ]
  >
) {
  if (!args || !args.length) return undefined;

  if (args.length <= 3) {
    const [table, data, strategy] = args;

    if (!table) return undefined;
    if (!(table instanceof _Q)) {
      if (data instanceof _Q) {
        return data.value;
      }
      if (!data) return new _Q(table);

      const keys = Object.keys(data);
      const conditions = keys.map((key) => eq(table[key]!, data[key]));
      return strategy === "AND" ? and(...conditions) : or(...conditions);
    }
  }

  return (args as Array<_Q<T>>).reduce((acc, curr) => {
    if (!acc) acc = curr;
    acc.combine(curr);
    return acc;
  }, undefined as _Q<T> | undefined);
}

/**
 * Represents a query object for a specific database table.
 * Allows building SQL query conditions using 'AND' and 'OR' strategies.
 *
 * @template T - Type extending TableConfig defining the table structure
 */
class _Q<T extends TableConfig> {
  private conditions: SQL[] = [];
  private readonly _table: TableWithColumns<T>;

  /**
   * Creates a new query object instance.
   *
   * @param {TableWithColumns<T>} table - The database table to query
   */
  constructor(table: TableWithColumns<T>) {
    this._table = table;
  }

  /**
   * Gets the resulting SQL conditions or undefined if no conditions are present.
   *
   * @returns {SQL | undefined} The resulting SQL conditions or undefined
   */
  get value(): SQL | undefined {
    return this.conditions.length ? and(...this.conditions) : undefined;
  }

  get table() {
    return this._table;
  }

  /**
   * Adds an 'OR' condition to the query object.
   *
   * @param {Partial<TableWithFields<T>>} data - Object containing fields to match
   * @returns {_Q<T>} The current query object instance
   */
  or(data: Partial<TableWithFields<T>>): this {
    return this.sqlJoin(data, "OR");
  }

  /**
   * Adds an 'AND' condition to the query object.
   *
   * @param {Partial<TableWithFields<T>>} data - Object containing fields to match
   * @returns {_Q<T>} The current query object instance
   */
  and(data: Partial<TableWithFields<T>>): this {
    return this.sqlJoin(data, "AND");
  }

  /**
   * Internal method to add conditions to the query object based on the provided data
   * and join strategy.
   *
   * @param {Partial<TableWithFields<T>>} data - Object containing fields to match
   * @param {JoinStrategy} strategy - Join strategy ('AND' or 'OR')
   * @returns {_Q<T>} The current query object instance
   * @private
   */
  private sqlJoin(
    data: Partial<TableWithFields<T>>,
    strategy: JoinStrategy
  ): this {
    const keys = Object.keys(data) as (keyof TableWithColumns<T>)[];
    const conditions = keys.map((key) => eq(this._table[key], data[key]));
    const joinFn = strategy === "AND" ? and : or;

    if (this.conditions.length) {
      const newConditions = joinFn(...conditions);
      if (newConditions) this.conditions.push(newConditions);
    } else {
      this.conditions = conditions;
    }

    return this;
  }

  /**
   * Joins the query object with another _Q object using the specified strategy.
   * Will use inner join for different tables
   */
  combine(query: _Q<T>) {
    const conditions = query.value;
    if (query.table !== this.table) {
      const qb = new QueryBuilder();
      const condition = qb
        .select()
        .from(this.table)
        .innerJoin(query.table, query.value)
        .getSQL();
      this.conditions.push(condition);
      consola.warn("Untested query joins used: ");
      consola.trace(this, query);
    }
    if (conditions) {
      this.conditions.push(conditions);
    }
    return this;
  }
}

/**
 * Creates a new constructor function for _Q<T> instances that automatically sets the
 * table property based on the provided table argument.
 *
 * @template T - Type extending TableConfig defining the table structure
 * @returns {typeof _Q<T> & { new <T extends TableConfig>(table: TableWithColumns<T>): _Q<T>; }}
 *          A constructor function for _Q<T> instances
 */
function createQ<T extends TableConfig>(): typeof q & {
  new <T extends TableConfig>(table: TableWithColumns<T>): _Q<T>;
} {
  return new Proxy(q, {
    construct(target, args: [TableWithColumns<T>]) {
      return new _Q<T>(args[0]);
    },
  }) as any;
}

/**
 * A constructor function for creating SQL query conditions instances for a specific database table.
 *
 * @example
 * // Create a new query instance
 * const query = Q(usersTable);
 *
 * @example
 * // Create a query with field matching conditions
 * const activeUsersQ = Q(usersTable, {
 *   active: true,
 *   type: 'customer'
 * });
 *
 * const user = await db.select().from(usersTable).where(activeUsersQ)
 *
 * @example
 * const someShit = Q(tableA, {size: "large", gender: "male"}, "OR")
 * const otherShit = Q(tableA, {size: "not large", gender: "peacock"})
 * const shit = Q(someShit, otheShit)
 */
export const Q = createQ();

/**
 * Represents a union type of either a Partial<T> or the return type of the createQ function.
 *
 * There's an optional second type argument which is an array or the keys of `T` that must be present.
 *
 * @template T - Any type
 *
 * @example
 * // When 2nd type argument is passed
 * const data: Query<{
 *     username: string,
 *     id: string
 *   }, ["id"]> = {username: "nigger1"} // will error because id is required
 */
export type Query<T = any, C extends (keyof T)[] = []> = OneOf<
  [Partial<Omit<T, C[number]>> & Pick<T, C[number]>, ReturnType<typeof createQ>]
>;

export const updateConflictedColumns = <
  T extends PgTable | SQLiteTable,
  Q extends keyof T["_"]["columns"]
>(
  table: T,
  columns: Q[]
) => {
  const cls = getTableColumns(table);
  return columns.reduce((acc, column) => {
    const colName = cls[column]!.name;
    acc[column] = sql.raw(`excluded.${colName}`);
    return acc;
  }, {} as Record<Q, SQL>);
};
