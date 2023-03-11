import { CreateOnePayload } from './payloads/createOnePayload';
import { DeleteOnePayload } from './payloads/deleteOnePayload';
import { FindManyPayload } from './payloads/findManyPayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { Category } from '../../../domain/entities/category/category';

export interface CategoryRepository {
  createOne(input: CreateOnePayload): Promise<Category>;
  findOne(input: FindOnePayload): Promise<Category | null>;
  findMany(input: FindManyPayload): Promise<Category[]>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
