import { HttpHeader } from '../../common/http/httpHeader';
import { Schema } from '../validator/schema';
import { SchemaType } from '../validator/schemaType';

export const headersSchema = Schema.object({
  [HttpHeader.contentType]: Schema.string().optional(),
  [HttpHeader.accept]: Schema.string().optional(),
}).passthrough();

export type Headers = SchemaType<typeof headersSchema>;
