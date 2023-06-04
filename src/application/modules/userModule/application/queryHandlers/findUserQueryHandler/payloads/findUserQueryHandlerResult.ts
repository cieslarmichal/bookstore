import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { User } from '../../../../domain/entities/user/user';

export const findUserQueryHandlerResultSchema = Schema.object({
  user: Schema.instanceof(User),
});

export type FindUserQueryHandlerResult = SchemaType<typeof findUserQueryHandlerResultSchema>;
