import 'reflect-metadata';
import express from 'express';
import { Container as ContainerFromExtensions } from 'typeorm-typedi-extensions';
import { useContainer } from 'typeorm';
import { BookController } from './app/controllers/book/bookController';
import Container from 'typedi';
import { errorMiddleware } from './app/middlewares';
import dotenv from 'dotenv';
import path from 'path';
import { PostgresConnectionManager } from './app/shared/db/postgresConnectionManager';

const envFileName = process.env.NODE_ENV === 'test' ? '.env.testing' : '.env';

dotenv.config({ path: path.resolve(__dirname, `../${envFileName}`) });

useContainer(ContainerFromExtensions);

PostgresConnectionManager.connect();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const bookController = Container.get(BookController);

app.use('/v1', bookController.router);

app.use(errorMiddleware);

const PORT = 3000;

async function bootstrap() {
  await app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}
bootstrap();
