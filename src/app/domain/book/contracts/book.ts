import { IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

import { BookFormat } from './bookFormat';
import { BookLanguage } from './bookLanguage';
import { Validator } from '../../../common/validator/validator';

export class Book {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsString()
  public readonly title: string;

  @IsNumber()
  public readonly releaseYear: number;

  @IsEnum(BookLanguage)
  public readonly language: BookLanguage;

  @IsEnum(BookFormat)
  public readonly format: BookFormat;

  @IsString()
  @IsOptional()
  public readonly description?: string | undefined;

  @IsNumber()
  public readonly price: number;

  public constructor({ id, createdAt, updatedAt, title, releaseYear, language, format, description, price }: Book) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
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
