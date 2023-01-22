import { IsString, IsEnum, IsNumber, IsOptional } from '../../../../../common/validator/decorators';
import { Validator } from '../../../../../common/validator/validator';
import { BookFormat } from '../../bookFormat';
import { BookLanguage } from '../../bookLanguage';

export class CreateBookData {
  @IsString()
  public title: string;

  @IsNumber()
  public releaseYear: number;

  @IsEnum(BookLanguage)
  public language: BookLanguage;

  @IsEnum(BookFormat)
  public format: BookFormat;

  @IsString()
  @IsOptional()
  public description?: string;

  @IsNumber()
  public price: number;

  public constructor({ title, releaseYear, language, format, description, price }: CreateBookData) {
    this.title = title;
    this.releaseYear = releaseYear;
    this.language = language;
    this.format = format;
    this.price = price;

    if (description) {
      this.description = description;
    }

    Validator.validate(this);
  }
}
