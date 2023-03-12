import { CreateOnePayload } from './payloads/createOnePayload';
import { DeleteOnePayload } from './payloads/deleteOnePayload';
import { FindManyPayload } from './payloads/findManyPayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { UpdateOnePayload } from './payloads/updateOnePayload';
import { Book } from '../../../domain/entities/book/book';

export interface BookRepository {
  createOne(input: CreateOnePayload): Promise<Book>;
  findOne(input: FindOnePayload): Promise<Book | null>;
  findMany(input: FindManyPayload): Promise<Book[]>;
  updateOne(input: UpdateOnePayload): Promise<Book>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
