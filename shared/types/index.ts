import type { TableConfig, Table } from "drizzle-orm"

export type TypeFromLiteral<T> =
  T extends 'string' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'bigint' ? bigint :
  T extends 'float' ? number :
  T extends 'double' ? number :
  T extends 'real' ? number :
  T extends 'date' ? Date :
  T extends 'datetime' ? Date :
  T extends 'timestamp' ? Date :
  T extends 'blob' ? Buffer :
  T extends 'buffer' ? Buffer :
  T extends 'json' ? any :
  T extends 'jsonb' ? any :
  T extends 'array' ? any[] :
  T extends 'object' ? Record<string, any> :
  never;

export type TableWithFields<T extends TableConfig> = {
  [Key in keyof T['columns']]: TypeFromLiteral<T['columns'][Key]['dataType']> | null
};

export type TableWithColumns<T extends TableConfig> = Table<T> & {
  [Key in keyof T['columns']]: T['columns'][Key];
};

export type Partial<T> = { [P in keyof T]?: T[P] | null | undefined; }
