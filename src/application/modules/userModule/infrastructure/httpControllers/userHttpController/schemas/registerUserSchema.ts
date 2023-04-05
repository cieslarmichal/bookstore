import { userSchema } from './userSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const registerUserBodySchema = Schema.union([
  Schema.object({
    email: Schema.notEmptyString(),
    password: Schema.notEmptyString(),
  }),
  Schema.object({
    phoneNumber: Schema.notEmptyString(),
    password: Schema.notEmptyString(),
  }),
]);

export type RegisterUserBody = SchemaType<typeof registerUserBodySchema>;

export const registerUserResponseCreatedBodySchema = Schema.object({
  user: userSchema,
});

export type RegisterUserResponseCreatedBody = SchemaType<typeof registerUserResponseCreatedBodySchema>;
