import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Schema } from '../../../common/validator/implementations/schema';
import { Book } from '../../book/contracts/book';

export const authorInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  firstName: Schema.notEmptyString(),
  lastName: Schema.notEmptyString(),
  about: Schema.notEmptyString().optional(),
  books: Schema.array(Schema.instanceof(Book)).optional(),
});

export type AuthorInput = SchemaType<typeof authorInputSchema>;

export class Author {
  public readonly id: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly about?: string;
  public readonly books?: Book[];

  public constructor(input: AuthorInput) {
    const { id, firstName, lastName, about, books } = PayloadFactory.create(authorInputSchema, input);

    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;

    if (about) {
      this.about = about;
    }

    if (books) {
      this.books = books;
    }
  }
}
