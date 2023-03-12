import { Schema } from '../../../../../libs/validator/schema';
import { Validator } from '../../../../../libs/validator/validator';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const customerInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  userId: Schema.notEmptyString(),
});

export type CustomerInput = SchemaType<typeof customerInputSchema>;

export class Customer {
  public readonly id: string;
  public readonly userId: string;

  public constructor(input: CustomerInput) {
    const { id, userId } = Validator.validate(customerInputSchema, input);

    this.id = id;
    this.userId = userId;
  }
}
