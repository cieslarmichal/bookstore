import { Schema } from '../../../../validator/schema';
import { SchemaType } from '../../../../validator/schemaType';
import { LogContext } from '../../../logContext';

export const fatalPayloadSchema = Schema.object({
  message: Schema.string(),
  context: Schema.unsafeType<LogContext>().optional(),
});

export type FatalPayload = SchemaType<typeof fatalPayloadSchema>;
