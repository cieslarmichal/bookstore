import { CreateOnePayload } from './payloads/createOnePayload';
import { DeleteOnePayload } from './payloads/deleteOnePayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { AuthorBook } from '../../../domain/entities/authorBook/authorBook';

export interface AuthorBookRepository {
  createOne(input: CreateOnePayload): Promise<AuthorBook>;
  findOne(input: FindOnePayload): Promise<AuthorBook | null>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
