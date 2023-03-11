import { SchemaType } from '../../../../validator/contracts/schemaType';
import { Schema } from '../../../../validator/implementations/schema';
import { LogContext } from '../../logContext';

export const warnPayloadSchema = Schema.object({
  message: Schema.string(),
  context: Schema.unsafeType<LogContext>().optional(),
});

export type WarnPayload = SchemaType<typeof warnPayloadSchema>;
