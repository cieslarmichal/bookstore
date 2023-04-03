import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Validator } from '../../../../../../libs/validator/validator';
import { Book } from '../../../../bookModule/domain/entities/book/book';

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
    const { id, firstName, lastName, about, books } = Validator.validate(authorInputSchema, input);

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
