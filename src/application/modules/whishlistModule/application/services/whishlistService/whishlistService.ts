import { CreateWhishlistEntryPayload } from './payloads/createWhishlistEntryPayload';
import { DeleteWhishlistEntryPayload } from './payloads/deleteWhishlistEntryPayload';
import { FindWhishlistEntriesPayload } from './payloads/findWhishlistEntriesPayload';
import { FindWhishlistEntryPayload } from './payloads/findWhishlistEntryPayload';
import { WhishlistEntry } from '../../../domain/entities/whishlistEntry/whishlistEntry';

export interface WhishlistService {
  createWhishlistEntry(input: CreateWhishlistEntryPayload): Promise<WhishlistEntry>;
  findWhishlistEntry(input: FindWhishlistEntryPayload): Promise<WhishlistEntry>;
  findWhishlistEntries(input: FindWhishlistEntriesPayload): Promise<WhishlistEntry[]>;
  deleteWhishlistEntry(input: DeleteWhishlistEntryPayload): Promise<void>;
}
