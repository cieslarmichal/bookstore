import { CreateOnePayload } from './createOnePayload';
import { DeleteOnePayload } from './deleteOnePayload';
import { FindOnePayload } from './findOnePayload';
import { BookCategory } from '../../bookCategory';

export interface BookCategoryRepository {
  createOne(input: CreateOnePayload): Promise<BookCategory>;
  findOne(input: FindOnePayload): Promise<BookCategory | null>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
