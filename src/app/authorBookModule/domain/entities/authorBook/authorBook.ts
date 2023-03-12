import { Schema } from '../../../../../libs/validator/implementations/schema';
import { Validator } from '../../../../../libs/validator/implementations/validator';
import { SchemaType } from '../../../../../libs/validator/schemaType';

export const authorBookInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  authorId: Schema.notEmptyString(),
  bookId: Schema.notEmptyString(),
});

export type AuthorBookInput = SchemaType<typeof authorBookInputSchema>;

export class AuthorBook {
  public readonly id: string;
  public readonly authorId: string;
  public readonly bookId: string;

  public constructor(input: AuthorBookInput) {
    const { id, authorId, bookId } = Validator.validate(authorBookInputSchema, input);

    this.id = id;
    this.authorId = authorId;
    this.bookId = bookId;
  }
}
