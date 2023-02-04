import { DataSource } from 'typeorm';

export interface PostgresConnector {
  connect(): Promise<DataSource>;
  closeConnection(): Promise<void>;
}
