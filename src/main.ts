import dotenv from 'dotenv';

import { App } from './app/app';
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
import { LogLevel } from './app/libs/logger/logLevel';
import { PostgresModule } from './app/libs/postgres/postgresModule';
import { EnvKey } from './envKey';
import { HttpServer } from './server/httpServer';

async function main(): Promise<void> {
  dotenv.config();

  const databaseHost = process.env[EnvKey.databaseHost];
  const databasePort = Number(process.env[EnvKey.databasePort]);
  const databaseName = process.env[EnvKey.databaseName];
  const databaseUser = process.env[EnvKey.databaseUser];
  const databasePassword = process.env[EnvKey.databasePassword];
  const jwtSecret = process.env[EnvKey.jwtSecret];
  const jwtExpiresIn = process.env[EnvKey.jwtExpiresIn];
  const hashSaltRounds = Number(process.env[EnvKey.hashSaltRounds]);
  const logLevel = process.env[EnvKey.logLevel] as LogLevel;
  const httpHost = process.env[EnvKey.httpHost];
  const httpPort = Number(process.env[EnvKey.httpPort]);

  console.log({
    databaseHost,
    databasePort,
    databaseName,
    databaseUser,
    databasePassword,
    jwtSecret,
    jwtExpiresIn,
    hashSaltRounds,
    logLevel,
    httpHost,
    httpPort,
  });

  if (
    !databaseHost ||
    !databasePort ||
    !databaseName ||
    !databaseUser ||
    !databasePassword ||
    !jwtSecret ||
    !jwtExpiresIn ||
    !hashSaltRounds ||
    !logLevel ||
    !httpHost ||
    !httpPort
  ) {
    throw new Error('Missing environment variables');
  }

  const container = await createDependencyInjectionContainer([
    new PostgresModule({ databaseHost, databasePort, databaseName, databaseUser, databasePassword }),
    new CategoryModule(),
    new BookModule(),
    new AuthorModule(),
    new UserModule({ jwtSecret, jwtExpiresIn, hashSaltRounds }),
    new IntegrationsModule(),
    new AuthorBookModule(),
    new LoggerModule({ logLevel }),
    new BookCategoryModule(),
    new AddressModule(),
    new CustomerModule(),
  ]);

  const app = new App(container);

  const server = new HttpServer(app.instance, { host: httpHost, port: httpPort });

  server.listen();
}

main();
