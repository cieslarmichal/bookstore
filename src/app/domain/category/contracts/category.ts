import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';
import { Validator } from '../../../../libs/validator/implementations/validator';

export const categoryInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  name: Schema.notEmptyString(),
});

export type CategoryInput = SchemaType<typeof categoryInputSchema>;

export class Category {
  public readonly id: string;
  public readonly name: string;

  public constructor(input: CategoryInput) {
    const { id, name } = Validator.validate(categoryInputSchema, input);

    this.id = id;
    this.name = name;
  }
}
