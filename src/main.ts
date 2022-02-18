import express from 'express';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { Book } from './app/domain/book/entities/book';
import { BookController } from './app/controllers/book/bookController';
import Container from 'typedi';
import { errorMiddleware } from './app/middlewares/errorMiddleware';
import { jsonMiddleware } from './app/middlewares/jsonMiddleware';
import bodyParser from 'body-parser';

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

app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json());
app.use(jsonMiddleware);

const bookController = Container.get(BookController);

app.use('/v1', bookController.router);

app.use(errorMiddleware);

const PORT = 3000;

async function bootstrap() {
  await app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}
bootstrap();
