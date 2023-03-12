import { Schema } from '../../../../validator/schema';
import { SchemaType } from '../../../../validator/schemaType';
import { LogContext } from '../../../logContext';

export const debugPayloadSchema = Schema.object({
  message: Schema.string(),
  context: Schema.unsafeType<LogContext>().optional(),
});

export type DebugPayload = SchemaType<typeof debugPayloadSchema>;
