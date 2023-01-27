import { CreateOnePayload } from './createOnePayload';
import { DeleteOnePayload } from './deleteOnePayload';
import { FindManyPayload } from './findManyPayload';
import { FindOnePayload } from './findOnePayload';
import { UpdateOnePayload } from './updateOnePayload';
import { Author } from '../../author';

export interface AuthorRepository {
  createOne(input: CreateOnePayload): Promise<Author>;
  findOne(input: FindOnePayload): Promise<Author | null>;
  findMany(input: FindManyPayload): Promise<Author[]>;
  updateOne(input: UpdateOnePayload): Promise<Author>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
