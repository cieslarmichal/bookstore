import { BookFormat } from './bookFormat';
import { BookLanguage } from './bookLanguage';
import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { PayloadFactory } from '../../../common/validator/implementations/payloadFactory';
import { Schema } from '../../../common/validator/implementations/schema';

export const bookInputSchema = Schema.object({
  id: Schema.notEmptyString(),
  title: Schema.notEmptyString(),
  releaseYear: Schema.positiveInteger(),
  language: Schema.enum(BookLanguage),
  format: Schema.enum(BookFormat),
  price: Schema.positiveNumber(),
  description: Schema.notEmptyString().optional(),
});

export type BookInput = SchemaType<typeof bookInputSchema>;

export class Book {
  public readonly id: string;
  public readonly title: string;
  public readonly releaseYear: number;
  public readonly language: BookLanguage;
  public readonly format: BookFormat;
  public readonly price: number;
  public readonly description?: string;

  public constructor(input: BookInput) {
    const { id, title, releaseYear, language, format, price, description } = PayloadFactory.create(
      bookInputSchema,
      input,
    );

    this.id = id;
    this.title = title;
    this.releaseYear = releaseYear;
    this.language = language;
    this.format = format;
    this.price = price;

    if (description) {
      this.description = description;
    }
  }
}
