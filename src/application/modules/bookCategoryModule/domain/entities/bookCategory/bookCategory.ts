import { Schema } from '../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../libs/validator/schemaType';
import { Validator } from '../../../../../../libs/validator/validator';

export const bookCategoryInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
  categoryId: Schema.notEmptyString(),
});

export type BookCategoryInput = SchemaType<typeof bookCategoryInputSchema>;

export class BookCategory {
  public readonly id: string;
  public readonly bookId: string;
  public readonly categoryId: string;

  public constructor(input: BookCategoryInput) {
    const { id, bookId, categoryId } = Validator.validate(bookCategoryInputSchema, input);

    this.id = id;
    this.bookId = bookId;
    this.categoryId = categoryId;
  }
}
