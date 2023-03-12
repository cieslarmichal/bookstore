import { HttpHeader } from '../../common/http/httpHeader';
import { SchemaType } from '../validator/schemaType';
import { Schema } from '../validator/implementations/schema';

export const headersSchema = Schema.object({
  [HttpHeader.contentType]: Schema.string().optional(),
  [HttpHeader.accept]: Schema.string().optional(),
}).passthrough();

export type Headers = SchemaType<typeof headersSchema>;
