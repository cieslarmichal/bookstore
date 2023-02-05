import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Schema } from '../../../common/validator/implementations/schema';

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
    const { id, bookId, categoryId } = PayloadFactory.create(bookCategoryInputSchema, input);

    this.id = id;
    this.bookId = bookId;
    this.categoryId = categoryId;
  }
}
