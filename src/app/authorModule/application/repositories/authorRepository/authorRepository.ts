import { CreateOnePayload } from './payloads/createOnePayload';
import { DeleteOnePayload } from './payloads/deleteOnePayload';
import { FindManyPayload } from './payloads/findManyPayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { UpdateOnePayload } from './payloads/updateOnePayload';
import { Author } from '../../../domain/entities/author';

export interface AuthorRepository {
  createOne(input: CreateOnePayload): Promise<Author>;
  findOne(input: FindOnePayload): Promise<Author | null>;
  findMany(input: FindManyPayload): Promise<Author[]>;
  updateOne(input: UpdateOnePayload): Promise<Author>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
