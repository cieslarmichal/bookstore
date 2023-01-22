import { Connection, createConnection } from 'typeorm';

import { PostgresModuleConfig } from './postgresModuleConfig';
import { AddressEntity } from '../../domain/address/contracts/addressEntity';
import { AuthorEntity } from '../../domain/author/contracts/authorEntity';
import { AuthorBookEntity } from '../../domain/authorBook/contracts/authorBookEntity';
import { BookEntity } from '../../domain/book/contracts/bookEntity';
import { BookCategoryEntity } from '../../domain/bookCategory/contracts/bookCategoryEntity';
import { CategoryEntity } from '../../domain/category/contracts/categoryEntity';
import { CustomerEntity } from '../../domain/customer/contracts/customerEntity';
import { UserEntity } from '../../domain/user/contracts/userEntity';

export class PostgresConnector {
  private connection: Connection | null = null;

  public constructor(private readonly postgresModuleConfig: PostgresModuleConfig) {}

  public async getConnection(): Promise<Connection> {
    if (this.connection) {
      return this.connection;
    }

    const { databaseHost, databasePort, databaseUser, databasePassword, databaseName } = this.postgresModuleConfig;

    this.connection = await createConnection({
      type: 'postgres',
      host: databaseHost,
      port: databasePort,
      username: databaseUser,
      password: databasePassword,
      database: databaseName,
      entities: [
        BookEntity,
        AuthorEntity,
        UserEntity,
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
