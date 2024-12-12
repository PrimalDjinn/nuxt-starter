import { and, eq, or, SQL, type TableConfig } from "drizzle-orm";

type JoinStrategy = 'AND' | 'OR';
function q<T extends TableConfig>(
  table: TableWithColumns<T>
): _Q<T>;
function q<T extends TableConfig>(
  table: TableWithColumns<T>,
  data: Partial<TableWithFields<T>>,
  strategy?: JoinStrategy
): SQL;
function q<T extends TableConfig>(
  table: TableWithColumns<T>,
  data?: Partial<TableWithFields<T>>,
  strategy: JoinStrategy = 'AND'
) {
  if (!data) return new _Q(table)
  const keys = Object.keys(data) as (keyof TableWithColumns<T>)[];
  const conditions = keys.map(key => eq(table[key], data[key]));
  return strategy === 'AND' ? and(...conditions) : or(...conditions);
}

class _Q<T extends TableConfig> {
  private conditions: SQL[] = [];
  private readonly table: TableWithColumns<T>;

  constructor(table: TableWithColumns<T>) {
    this.table = table;
  }

  get value(): SQL | undefined {
    return this.conditions.length ? and(...this.conditions) : undefined;
  }

  or(data: Partial<TableWithFields<T>>): this {
    return this.join(data, 'OR');
  }

  and(data: Partial<TableWithFields<T>>): this {
    return this.join(data, 'AND');
  }

  private join(data: Partial<TableWithFields<T>>, strategy: JoinStrategy): this {
    const keys = Object.keys(data) as (keyof TableWithColumns<T>)[];
    const conditions = keys.map(key => eq(this.table[key], data[key]));
    const joinFn = strategy === 'AND' ? and : or;

    if (this.conditions.length) {
      const newConditions = joinFn(...conditions)
      if (newConditions) this.conditions.push(newConditions);
    } else {
      this.conditions = conditions;
    }

    return this;
  }
}

function createQ<T extends TableConfig>(): typeof q & {
  new <T extends TableConfig>(table: TableWithColumns<T>): _Q<T>;
} {
  return new Proxy(q, {
    construct(target, args: [TableWithColumns<T>]) {
      return new _Q<T>(args[0]);
    }
  }) as any;
}

export const Q = createQ();
