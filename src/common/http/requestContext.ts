import { Schema } from '../../libs/validator/schema';
import { SchemaType } from '../../libs/validator/schemaType';
import { UserRole } from '../types/userRole';

export const requestContextSchema = Schema.object({
  userId: Schema.string().optional(),
  role: Schema.enum(UserRole).optional(),
});

export type RequestContext = SchemaType<typeof requestContextSchema>;
