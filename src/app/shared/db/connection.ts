import { Book } from '../../domain/book/entities/book';
import { createConnection } from 'typeorm';

export function createDbConnection() {
  return createConnection({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Book],
    synchronize: true,
  });
}
