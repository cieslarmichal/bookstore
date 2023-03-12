import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';
import { Validator } from '../../../../../libs/validator/validator';

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
