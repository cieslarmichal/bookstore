import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Schema } from '../../../common/validator/implementations/schema';

export const customerInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  userId: Schema.notEmptyString(),
});

export type CustomerInput = SchemaType<typeof customerInputSchema>;

export class Customer {
  public readonly id: string;
  public readonly userId: string;

  public constructor(input: CustomerInput) {
    const { id, userId } = PayloadFactory.create(customerInputSchema, input);

    this.id = id;
    this.userId = userId;
  }
}
