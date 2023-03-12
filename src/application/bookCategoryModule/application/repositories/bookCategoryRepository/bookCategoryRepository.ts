import { CreateOnePayload } from './payloads/createOnePayload';
import { DeleteOnePayload } from './payloads/deleteOnePayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { BookCategory } from '../../../domain/entities/bookCategory/bookCategory';

export interface BookCategoryRepository {
  createOne(input: CreateOnePayload): Promise<BookCategory>;
  findOne(input: FindOnePayload): Promise<BookCategory | null>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
