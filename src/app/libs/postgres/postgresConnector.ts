import { DataSource } from 'typeorm';

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
  private dataSource: DataSource | null = null;

  public constructor(private readonly postgresModuleConfig: PostgresModuleConfig) {}

  public async connect(): Promise<DataSource> {
    if (this.dataSource) {
      return this.dataSource;
    }

    const { databaseHost, databasePort, databaseUser, databasePassword, databaseName } = this.postgresModuleConfig;

    const dataSource = new DataSource({
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

    this.dataSource = await dataSource.initialize();

    return this.dataSource;
  }

  public async closeConnection(): Promise<void> {
    await this.dataSource?.destroy();

    this.dataSource = null;
  }
}
