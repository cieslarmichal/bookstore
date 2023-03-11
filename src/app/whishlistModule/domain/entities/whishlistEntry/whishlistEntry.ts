import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';
import { Validator } from '../../../../../libs/validator/implementations/validator';

export const whishlistEntryInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
  customerId: Schema.notEmptyString(),
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
