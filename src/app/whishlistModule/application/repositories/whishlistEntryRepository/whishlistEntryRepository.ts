import { CreateOnePayload } from './payloads/createOnePayload';
import { DeleteOnePayload } from './payloads/deleteOnePayload';
import { FindManyPayload } from './payloads/findManyPayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { WhishlistEntry } from '../../../domain/entities/whishlistEntry/whishlistEntry';

export interface WhishlistEntryRepository {
  createOne(input: CreateOnePayload): Promise<WhishlistEntry>;
  findOne(input: FindOnePayload): Promise<WhishlistEntry | null>;
  findMany(input: FindManyPayload): Promise<WhishlistEntry[]>;
  deleteOne(input: DeleteOnePayload): Promise<void>;
}
