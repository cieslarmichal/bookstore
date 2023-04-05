import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Validator } from '../../../../../../libs/validator/validator';

export const whishlistEntryInputSchema = Schema.object({
  id: Schema.string(),
  bookId: Schema.string(),
  customerId: Schema.string(),
});

export type WhishlistEntryInput = SchemaType<typeof whishlistEntryInputSchema>;

export class WhishlistEntry {
  public readonly id: string;
  public readonly bookId: string;
  public readonly customerId: string;

  public constructor(input: WhishlistEntryInput) {
    const { id, bookId, customerId } = Validator.validate(whishlistEntryInputSchema, input);

    this.id = id;
    this.bookId = bookId;
    this.customerId = customerId;
  }
}
