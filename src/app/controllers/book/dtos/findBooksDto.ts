import {
  IsEnum,
  IsNumber,
  IsOptional,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BookFormat, BookLanguage } from '../../../domain/book/types';
import { BookDto } from './bookDto';

export class FindBooksQueryDto {
  @IsOptional()
  @Validate(FilterHasStringProperty, {})
  public readonly title?: FilterProperty<string>;

  @IsOptional()
  @IsNumber()
  public readonly releaseYear?: number;

  @IsOptional()
  @IsEnum(BookLanguage)
  public readonly language?: BookLanguage;

  @IsOptional()
  @IsEnum(BookFormat)
  public readonly format?: BookFormat;

  @IsOptional()
  @IsNumber()
  public readonly price?: number;
}

export class FindBooksResponseData {
  public constructor(public readonly books: BookDto[]) {}
}

export class FindBooksResponseDto {
  public constructor(public readonly data: FindBooksResponseData, public readonly statusCode: number) {}
}
