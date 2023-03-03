import { CreateOnePayload } from './createOnePayload';
import { DeleteOnePayload } from './deleteOnePayload';
import { FindManyPayload } from './findManyPayload';
import { FindOnePayload } from './findOnePayload';
import { WhishlistEntry } from '../../whishlistEntry';

export interface WhishlistEntryRepository {
  createOne(input: CreateOnePayload): Promise<WhishlistEntry>;
  findOne(input: FindOnePayload): Promise<WhishlistEntry | null>;
  findMany(input: FindManyPayload): Promise<WhishlistEntry[]>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
