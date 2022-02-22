import 'reflect-metadata';
import express from 'express';
import { BookController } from './app/controllers/book/bookController';
import Container from 'typedi';
import { errorMiddleware } from './app/middlewares';
import { PostgresConnectionManager } from './app/shared/db';
import { Container as ContainerFromExtensions } from 'typeorm-typedi-extensions';
import { useContainer } from 'typeorm';
import { ConfigLoader } from './app/config';
import http from 'http';

export class App {
  private app: express.Application;
  private server: http.Server;

  public constructor() {
    this.app = express();
    this.setup();
  }

  private setup() {
    ConfigLoader.loadConfig();

    useContainer(ContainerFromExtensions);

    PostgresConnectionManager.connect();

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    const bookController = Container.get(BookController);

    this.app.use('/v1', bookController.router);
    this.app.use(errorMiddleware);
  }

  public run() {
    const httpPort = process.env.HTTP_PORT;

    this.server = this.app.listen(httpPort, () => {
      console.log(`server running on port ${httpPort}`);
    });
  }

  public stop() {
    this.server.close();
  }
}
