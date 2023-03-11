export type EntityConstructor = new () => unknown;

export interface PostgresModuleConfig {
  readonly databaseHost: string;
  readonly databasePort: number;
  readonly databaseName: string;
  readonly databaseUser: string;
  readonly databasePassword: string;
  readonly entities: EntityConstructor[];
}
