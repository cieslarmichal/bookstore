import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Schema } from '../../../common/validator/implementations/schema';

export const reviewInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  isbn: Schema.notEmptyString(),
  rate: Schema.positiveInteger(),
  comment: Schema.notEmptyString().optional(),
  customerId: Schema.notEmptyString(),
});

export type ReviewInput = SchemaType<typeof reviewInputSchema>;

export class Review {
  public readonly id: string;
  public readonly isbn: string;
  public readonly rate: number;
  public readonly comment?: string;
  public readonly customerId: string;

  public constructor(input: ReviewInput) {
    const { id, isbn, rate, customerId, comment } = PayloadFactory.create(reviewInputSchema, input);

    this.id = id;
    this.isbn = isbn;
    this.rate = rate;
    this.customerId = customerId;

    if (comment) {
      this.comment = comment;
    }
  }
}
