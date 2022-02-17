import express from 'express';
import { bookRouter } from './app/routes';

const app = express();

app.use(express.json());
app.use('/v1/books', bookRouter);

const PORT = 3000;

async function bootstrap() {
  await app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}
bootstrap();
