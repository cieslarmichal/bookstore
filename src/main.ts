import 'reflect-metadata';
import dotenv from 'dotenv';

import { App } from './app/app';
import { AppConfig } from './app/appConfig';
import { LogLevel } from './app/libs/logger/logLevel';
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

  const appConfig: AppConfig = {
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

  const app = new App(appConfig);

  const server = new HttpServer(app.instance, { host: httpHost, port: httpPort });

  server.listen();
}

main();
