import 'reflect-metadata';
import express from 'express';
import { Container as ContainerFromExtensions } from 'typeorm-typedi-extensions';
import { useContainer } from 'typeorm';
import { BookController } from './app/controllers/book/bookController';
import Container from 'typedi';
import { errorMiddleware } from './app/middlewares';
import { PostgresConnectionManager } from './app/shared/db';
import { ConfigLoader } from './app/config';

ConfigLoader.loadConfig();

useContainer(ContainerFromExtensions);

PostgresConnectionManager.connect();

const server = express();

server.use(express.urlencoded({ extended: false }));
server.use(express.json());

const bookController = Container.get(BookController);

server.use('/v1', bookController.router);

server.use(errorMiddleware);

async function bootstrap() {
  server.listen(process.env.HTTP_PORT, () => console.log(`Listening on port ${process.env.HTTP_PORT}`));
}
bootstrap();

module.exports = server;
