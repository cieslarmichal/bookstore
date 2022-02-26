import { Book } from '../../domain/book/entities/book';
import { Author } from '../../domain/author/entities/author';
import { Connection, createConnection } from 'typeorm';

export class ConnectionManager {
  private static connection: Connection;

  private constructor() {}

  public static async getConnection(): Promise<Connection> {
    if (ConnectionManager.connection) {
      return ConnectionManager.connection;
    }

    ConnectionManager.connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Book, Author],
      synchronize: true,
    });

    return ConnectionManager.connection;
  }
}
