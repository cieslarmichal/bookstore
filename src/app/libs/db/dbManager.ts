import { Book } from '../../domain/book/entities/book';
import { AuthorEntity } from '../../domain/author/contracts/authorEntity';
import { Connection, createConnection } from 'typeorm';
import { User } from '../../domain/user/entities/user';
import { CategoryEntity } from '../../domain/category/contracts/categoryEntity';
import { AuthorBookEntity } from '../../domain/authorBook/contracts/authorBookEntity';
import { BookCategoryEntity } from '../../domain/bookCategory/contracts/bookCategoryEntity';
import { AddressEntity } from '../../domain/address/addressEntity';
import { CustomerEntity } from '../../domain/customer/contracts/customerEntity';

export class DbManager {
  private connection: Connection | null;

  public async getConnection(): Promise<Connection> {
    if (this.connection) {
      return this.connection;
    }

    this.connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        Book,
        AuthorEntity,
        User,
        CategoryEntity,
        AuthorBookEntity,
        BookCategoryEntity,
        AddressEntity,
        CustomerEntity,
      ],
      synchronize: true,
    });

    return this.connection;
  }

  public async closeConnection(): Promise<void> {
    await this.connection?.close();

    this.connection = null;
  }
}

export const dbManager = new DbManager();
