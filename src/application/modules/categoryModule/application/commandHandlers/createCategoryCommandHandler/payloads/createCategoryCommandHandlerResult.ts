import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Category } from '../../../../domain/entities/category/category';

export const createCategoryCommandHandlerResultSchema = Schema.object({
  category: Schema.instanceof(Category),
});

export type CreateCategoryCommandHandlerResult = SchemaType<typeof createCategoryCommandHandlerResultSchema>;
