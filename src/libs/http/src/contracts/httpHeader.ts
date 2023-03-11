import { HttpHeader } from '../../../../common/http/contracts/httpHeader';
import { SchemaType } from '../../../validator/contracts/schemaType';
import { Schema } from '../../../validator/implementations/schema';

export const headersSchema = Schema.object({
  [HttpHeader.contentType]: Schema.string().optional(),
  [HttpHeader.accept]: Schema.string().optional(),
}).passthrough();

export type Headers = SchemaType<typeof headersSchema>;
