import { CreateOnePayload } from './createOnePayload';
import { DeleteOnePayload } from './deleteOnePayload';
import { FindManyPayload } from './findManyPayload';
import { FindOnePayload } from './findOnePayload';
import { UpdateOnePayload } from './updateOnePayload';
import { Review } from '../../review';

export interface ReviewRepository {
  createOne(input: CreateOnePayload): Promise<Review>;
  findOne(input: FindOnePayload): Promise<Review | null>;
  findMany(input: FindManyPayload): Promise<Review[]>;
  updateOne(input: UpdateOnePayload): Promise<Review>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
