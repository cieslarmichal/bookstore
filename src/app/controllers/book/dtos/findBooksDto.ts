import { IsOptional, Validate } from 'class-validator';
import { BookFormat, BookLanguage } from '../../../domain/book/types';
import { FilterHasNumberProperty, FilterHasStringProperty, FilterProperty } from '../../shared/filters';
import { FilterHasBookFormatProperty, FilterHasBookLanguageProperty } from '../filters';
import { BookDto } from './bookDto';

export class FindBooksQueryDto {
  @IsOptional()
  @Validate(FilterHasStringProperty, {})
  public readonly title?: FilterProperty<string>;

  @IsOptional()
  @Validate(FilterHasNumberProperty, {})
  public readonly releaseYear?: FilterProperty<number>;

  @IsOptional()
  @Validate(FilterHasBookLanguageProperty, {})
  public readonly language?: FilterProperty<BookLanguage>;

  @IsOptional()
  @Validate(FilterHasBookFormatProperty, {})
  public readonly format?: FilterProperty<BookFormat>;

  @IsOptional()
  @Validate(FilterHasNumberProperty, {})
  public readonly price?: FilterProperty<number>;
}

export class FindBooksResponseData {
  public constructor(public readonly books: BookDto[]) {}
}

export class FindBooksResponseDto {
  public constructor(public readonly data: FindBooksResponseData, public readonly statusCode: number) {}
}
