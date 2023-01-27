import { CreateOnePayload } from './createOnePayload';
import { DeleteOnePayload } from './deleteOnePayload';
import { FindOnePayload } from './findOnePayload';
import { AuthorBook } from '../../authorBook';

export interface AuthorBookRepository {
  createOne(input: CreateOnePayload): Promise<AuthorBook>;
  findOne(input: FindOnePayload): Promise<AuthorBook | null>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
