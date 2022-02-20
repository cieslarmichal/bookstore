import 'reflect-metadata';
import express from 'express';
import { Container as ContainerFromExtensions } from 'typeorm-typedi-extensions';
import { createConnection, useContainer } from 'typeorm';
import { Book } from './app/domain/book/entities/book';
import { BookController } from './app/controllers/book/bookController';
import Container from 'typedi';
import { errorMiddleware } from './app/middlewares';

useContainer(ContainerFromExtensions);

(async () => {
  await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'bookstore',
    entities: [Book],
    synchronize: true,
  });

  console.log('Connected to postgres database on port 5432');
})();

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
