import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { Category } from '../../../../domain/entities/category/category';

export const findCategoriesQueryHandlerResultSchema = Schema.object({
  categories: Schema.array(Schema.instanceof(Category)),
});

export type FindCategoriesQueryHandlerResult = SchemaType<typeof findCategoriesQueryHandlerResultSchema>;
