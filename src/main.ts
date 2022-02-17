import express from 'express';
import 'reflect-metadata';
import { bookRouter } from './app/routes/book';

import { createConnection } from 'typeorm';

import { Book } from './app/domain/book/entities/book';

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
app.use('/v1/books', bookRouter);

const PORT = 3000;

async function bootstrap() {
  await app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}
bootstrap();
