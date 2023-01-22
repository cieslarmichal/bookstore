import { PostgresModuleConfig } from './postgresModuleConfig';

export class PostgresModuleConfigTestFactory {
  public create(): PostgresModuleConfig {
    return {
      databaseHost: 'localhost',
      databasePort: 5432,
      databaseName: 'bookstore',
      databaseUser: 'postgres',
      databasePassword: 'postgres',
    };
  }
}
