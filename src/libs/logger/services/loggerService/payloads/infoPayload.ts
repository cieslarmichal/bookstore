import { SchemaType } from '../../../../validator/schemaType';
import { Schema } from '../../../../validator/implementations/schema';
import { LogContext } from '../../logContext';

export const infoPayloadSchema = Schema.object({
  message: Schema.string(),
  context: Schema.unsafeType<LogContext>().optional(),
});

export type InfoPayload = SchemaType<typeof infoPayloadSchema>;
