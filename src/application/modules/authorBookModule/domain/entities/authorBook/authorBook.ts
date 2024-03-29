import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Validator } from '../../../../../../libs/validator/validator';

export const authorBookInputSchema = Schema.object({
  id: Schema.string(),
  authorId: Schema.string(),
  bookId: Schema.string(),
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
