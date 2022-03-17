import { Server } from './server';
import { App } from './app';
import { createDIContainer } from './app/shared';
import { BookModule } from './app/domain/book/bookModule';
import { AuthorModule } from './app/domain/author/authorModule';
import { DbModule } from './app/shared/db/dbModule';
import { ControllersModule } from './app/controllers/controllersModule';
import { UserModule } from './app/domain/user/userModule';
import { ConfigLoader } from './configLoader';
import { CategoryModule } from './app/domain/category/categoryModule';
import { LoggerModule } from './app/shared/logger/loggerModule';
import { AuthorBookModule } from './app/domain/authorBook/authorBookModule';
import { BookCategoryModule } from './app/domain/bookCategory/bookCategoryModule';

async function main() {
  ConfigLoader.loadConfig();

  const container = await createDIContainer([
    DbModule,
    CategoryModule,
    BookModule,
    AuthorModule,
    UserModule,
    ControllersModule,
    AuthorBookModule,
    LoggerModule,
    BookCategoryModule,
  ]);

  const app = new App(container);

  const server = new Server(app.instance);

  server.listen();
}

main();
