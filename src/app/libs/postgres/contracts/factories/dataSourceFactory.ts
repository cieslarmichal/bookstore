import { DataSource } from 'typeorm';

export interface DataSourceFactory {
  create(): DataSource;
}
