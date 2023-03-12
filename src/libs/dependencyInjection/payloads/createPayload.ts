import { Schema } from '../../validator/schema';
import { SchemaType } from '../../validator/schemaType';
import { DependencyInjectionModule } from '../dependencyInjectionModule';

export const createPayloadSchema = Schema.object({
  modules: Schema.array(Schema.unsafeType<DependencyInjectionModule>()),
});

export type CreatePayload = SchemaType<typeof createPayloadSchema>;
