import 'reflect-metadata';

import dotenv from 'dotenv';

import { ApplicationConfig } from './app/applicationConfig';
import { Application } from './app/application';
import { EnvKey } from './envKey';
import { LogLevel } from './libs/logger/contracts/logLevel';
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

  const appConfig: ApplicationConfig = {
    jwtSecret,
    jwtExpiresIn,
    hashSaltRounds,
    databaseHost,
    databasePort,
    databaseName,
    databaseUser,
    databasePassword,
    logLevel,
  };

  const app = new Application(appConfig);

  await app.initialize();

  const server = new HttpServer(app.instance, { host: httpHost, port: httpPort });

  await server.listen();
}

main();
