import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { LogContext } from '../../logContext';

export const debugPayloadSchema = Schema.object({
  message: Schema.string(),
  context: Schema.unsafeType<LogContext>().optional(),
});

export type DebugPayload = SchemaType<typeof debugPayloadSchema>;
