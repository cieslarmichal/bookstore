import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { User } from '../../../../domain/entities/user/user';

export const setUserEmailCommandHandlerResultSchema = Schema.object({
  user: Schema.instanceof(User),
});

export type SetUserEmailCommandHandlerResult = SchemaType<typeof setUserEmailCommandHandlerResultSchema>;
