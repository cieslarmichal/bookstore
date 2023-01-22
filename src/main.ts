import { App } from './app';
import { AddressModule } from './app/domain/address/addressModule';
import { AuthorModule } from './app/domain/author/authorModule';
import { AuthorBookModule } from './app/domain/authorBook/authorBookModule';
import { BookModule } from './app/domain/book/bookModule';
import { BookCategoryModule } from './app/domain/bookCategory/bookCategoryModule';
import { CategoryModule } from './app/domain/category/categoryModule';
import { CustomerModule } from './app/domain/customer/customerModule';
import { UserModule } from './app/domain/user/userModule';
import { IntegrationsModule } from './app/integrations/integrationsModule';
import { createDependencyInjectionContainer } from './app/libs/dependencyInjection/container';
import { LoggerModule } from './app/libs/logger/loggerModule';
import { PostgresModule } from './app/libs/postgres/postgresModule';
import { ConfigLoader } from './configLoader';
import { Server } from './server';

async function main(): Promise<void> {
  ConfigLoader.loadConfig();

  const container = await createDependencyInjectionContainer([
    PostgresModule,
    CategoryModule,
    BookModule,
    AuthorModule,
    UserModule,
    IntegrationsModule,
    AuthorBookModule,
    LoggerModule,
    BookCategoryModule,
    AddressModule,
    CustomerModule,
  ]);

  const app = new App(container);

  const server = new Server(app.instance);

  server.listen();
}

main();
