import { CreateOnePayload } from './createOnePayload';
import { DeleteOnePayload } from './deleteOnePayload';
import { FindManyPayload } from './findManyPayload';
import { FindOnePayload } from './findOnePayload';
import { UpdateOnePayload } from './updateOnePayload';
import { Book } from '../../book';

export interface BookRepository {
  createOne(input: CreateOnePayload): Promise<Book>;
  findOne(input: FindOnePayload): Promise<Book | null>;
  findMany(input: FindManyPayload): Promise<Book[]>;
  updateOne(input: UpdateOnePayload): Promise<Book>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
