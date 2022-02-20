import { Book } from '../../domain/book/entities/book';
import { createConnection } from 'typeorm';

export class PostgresConnectionManager {
  public static async connect(): Promise<void> {
    await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Book],
      synchronize: true,
    });

    console.log(`Connected to ${process.env.DB_NAME} database on port ${process.env.DB_PORT}`);
  }
}
