import { CreateWhishlistEntryPayload } from './createWhishlistEntryPayload';
import { DeleteWhishlistEntryPayload } from './deleteWhishlistEntryPayload';
import { FindWhishlistEntriesPayload } from './findWhishlistEntriesPayload';
import { FindWhishlistEntryPayload } from './findWhishlistEntryPayload';
import { WhishlistEntry } from '../../../domain/entities/whishlistEntry/whishlistEntry';

export interface WhishlistService {
  createWhishlistEntry(input: CreateWhishlistEntryPayload): Promise<WhishlistEntry>;
  findWhishlistEntry(input: FindWhishlistEntryPayload): Promise<WhishlistEntry>;
  findWhishlistEntries(input: FindWhishlistEntriesPayload): Promise<WhishlistEntry[]>;
  deleteWhishlistEntry(input: DeleteWhishlistEntryPayload): Promise<void>;
}
