import { CreateOnePayload } from './payloads/createOnePayload';
import { DeleteOnePayload } from './payloads/deleteOnePayload';
import { FindManyPayload } from './payloads/findManyPayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { UpdateOnePayload } from './payloads/updateOnePayload';
import { Review } from '../../../domain/entities/review/review';

export interface ReviewRepository {
  createOne(input: CreateOnePayload): Promise<Review>;
  findOne(input: FindOnePayload): Promise<Review | null>;
  findMany(input: FindManyPayload): Promise<Review[]>;
  updateOne(input: UpdateOnePayload): Promise<Review>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
