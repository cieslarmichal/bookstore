import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Schema } from '../../../common/validator/implementations/schema';

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
    const { id, authorId, bookId } = PayloadFactory.create(authorBookInputSchema, input);

    this.id = id;
    this.authorId = authorId;
    this.bookId = bookId;
  }
}
