import { SchemaType } from '../../validator/schemaType';
import { Schema } from '../../validator/implementations/schema';
import { DependencyInjectionModule } from '../dependencyInjectionModule';

export const createPayloadSchema = Schema.object({
  modules: Schema.array(Schema.unsafeType<DependencyInjectionModule>()),
});

export type CreatePayload = SchemaType<typeof createPayloadSchema>;
