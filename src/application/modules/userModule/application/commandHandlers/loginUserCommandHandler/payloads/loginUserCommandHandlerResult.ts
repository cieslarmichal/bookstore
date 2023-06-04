import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const loginUserCommandHandlerResultSchema = Schema.object({
  accessToken: Schema.string(),
});

export type LoginUserCommandHandlerResult = SchemaType<typeof loginUserCommandHandlerResultSchema>;
