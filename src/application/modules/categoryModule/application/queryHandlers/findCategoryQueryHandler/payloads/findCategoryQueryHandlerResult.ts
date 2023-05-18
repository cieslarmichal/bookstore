import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Category } from '../../../../domain/entities/category/category';

export const findCategoryQueryHandlerResultSchema = Schema.object({
  category: Schema.instanceof(Category),
});

export type FindCategoryQueryHandlerResult = SchemaType<typeof findCategoryQueryHandlerResultSchema>;
