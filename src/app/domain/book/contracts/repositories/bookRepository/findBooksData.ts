import { IsOptional } from '../../../../../common/validator/decorators';
import { Validator } from '../../../../../common/validator/validator';
import { FilterProperty } from '../../../../common/filterProperty';

export class FindBooksData {
  @IsOptional()
  public readonly title?: FilterProperty;

  @IsOptional()
  public readonly releaseYear?: FilterProperty;

  @IsOptional()
  public readonly language?: FilterProperty;

  @IsOptional()
  public readonly format?: FilterProperty;

  @IsOptional()
  public readonly price?: FilterProperty;

  public constructor({ title, releaseYear, language, format, price }: FindBooksData) {
    if (title) {
      this.title = title;
    }

    if (releaseYear) {
      this.releaseYear = releaseYear;
    }

    if (language) {
      this.language = language;
    }

    if (format) {
      this.format = format;
    }

    if (price) {
      this.price = price;
    }

    Validator.validate(this);
  }
}
