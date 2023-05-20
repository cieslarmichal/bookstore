import { CreateLineItemPayload } from './payloads/createLineItemPayload';
import { DeleteLineItemPayload } from './payloads/deleteLineItemPayload';
import { FindLineItemPayload } from './payloads/findLineItemPayload';
import { FindLineItemsPayload } from './payloads/findLineItemsPayload';
import { UpdateLineItemPayload } from './payloads/updateLineItemPayload';
import { LineItem } from '../../../domain/entities/lineItem/lineItem';

export interface LineItemRepository {
  createLineItem(input: CreateLineItemPayload): Promise<LineItem>;
  findLineItem(input: FindLineItemPayload): Promise<LineItem | null>;
  findLineItems(input: FindLineItemsPayload): Promise<LineItem[]>;
  updateLineItem(input: UpdateLineItemPayload): Promise<LineItem>;
  deleteLineItem(input: DeleteLineItemPayload): Promise<void>;
}
