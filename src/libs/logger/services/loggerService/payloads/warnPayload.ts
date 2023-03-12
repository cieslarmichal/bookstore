import { Schema } from '../../../../validator/schema';
import { SchemaType } from '../../../../validator/schemaType';
import { LogContext } from '../../../logContext';

export const warnPayloadSchema = Schema.object({
  message: Schema.string(),
  context: Schema.unsafeType<LogContext>().optional(),
});

export type WarnPayload = SchemaType<typeof warnPayloadSchema>;
