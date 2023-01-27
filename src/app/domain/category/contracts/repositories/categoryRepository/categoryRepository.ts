import { CreateOnePayload } from './createOnePayload';
import { DeleteOnePayload } from './deleteOnePayload';
import { FindManyPayload } from './findManyPayload';
import { FindOnePayload } from './findOnePayload';
import { Category } from '../../category';

export interface CategoryRepository {
  createOne(input: CreateOnePayload): Promise<Category>;
  findOne(input: FindOnePayload): Promise<Category | null>;
  findMany(input: FindManyPayload): Promise<Category[]>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
