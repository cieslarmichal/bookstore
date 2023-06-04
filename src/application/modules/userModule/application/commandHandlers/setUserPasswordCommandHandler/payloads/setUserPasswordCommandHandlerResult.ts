import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { User } from '../../../../domain/entities/user/user';

export const setUserPasswordCommandHandlerResultSchema = Schema.object({
  user: Schema.instanceof(User),
});

export type SetUserPasswordCommandHandlerResult = SchemaType<typeof setUserPasswordCommandHandlerResultSchema>;
