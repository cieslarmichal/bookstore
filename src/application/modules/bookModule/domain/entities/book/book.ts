import { BookFormat } from './bookFormat';
import { BookLanguage } from './bookLanguage';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Validator } from '../../../../../../libs/validator/validator';

export const bookInputSchema = Schema.object({
  id: Schema.string(),
  title: Schema.string(),
  isbn: Schema.string(),
  releaseYear: Schema.positiveInteger(),
  language: Schema.enum(BookLanguage),
  format: Schema.enum(BookFormat),
  price: Schema.positiveNumber(),
  description: Schema.string().optional(),
});

export type BookInput = SchemaType<typeof bookInputSchema>;

export class Book {
  public readonly id: string;
  public readonly title: string;
  public readonly isbn: string;
  public readonly releaseYear: number;
  public readonly language: BookLanguage;
  public readonly format: BookFormat;
  public readonly price: number;
  public readonly description?: string;

  public constructor(input: BookInput) {
    const { id, title, isbn, releaseYear, language, format, price, description } = Validator.validate(
      bookInputSchema,
      input,
    );

    this.id = id;
    this.title = title;
    this.isbn = isbn;
    this.releaseYear = releaseYear;
    this.language = language;
    this.format = format;
    this.price = price;

    if (description) {
      this.description = description;
    }
  }
}
