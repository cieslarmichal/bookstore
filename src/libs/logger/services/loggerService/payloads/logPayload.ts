import { Schema } from '../../../../validator/schema';
import { SchemaType } from '../../../../validator/schemaType';
import { LogContext } from '../../../logContext';

export const logPayloadSchema = Schema.object({
  message: Schema.string(),
  context: Schema.unsafeType<LogContext>().optional(),
});

export type LogPayload = SchemaType<typeof logPayloadSchema>;
