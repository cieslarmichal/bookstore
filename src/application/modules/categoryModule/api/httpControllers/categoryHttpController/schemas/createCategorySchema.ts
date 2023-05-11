import { categorySchema } from './categorySchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createCategoryBodySchema = Schema.object({
  name: Schema.string(),
});

export type CreateCategoryBody = SchemaType<typeof createCategoryBodySchema>;

export const createCategoryResponseCreatedBodySchema = Schema.object({
  category: categorySchema,
});

export type CreateCategoryResponseCreatedBody = SchemaType<typeof createCategoryResponseCreatedBodySchema>;
