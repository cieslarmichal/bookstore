import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { User } from '../../../../domain/entities/user/user';

export const registerUserCommandHandlerResultSchema = Schema.object({
  user: Schema.instanceof(User),
});

export type RegisterUserCommandHandlerResult = SchemaType<typeof registerUserCommandHandlerResultSchema>;
