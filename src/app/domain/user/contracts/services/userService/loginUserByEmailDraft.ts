import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';

export const loginUserByEmailDraftSchema = Schema.object({
  email: Schema.notEmptyString(),
  password: Schema.notEmptyString(),
});

export type LoginUserByEmailDraft = SchemaType<typeof loginUserByEmailDraftSchema>;
