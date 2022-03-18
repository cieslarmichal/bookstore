import { IsOptional, Validate } from 'class-validator';
import { BookFormat, BookLanguage } from '../../../domain/book/types';
import {
  FilterHasNumberPropertyConstraint,
  FilterHasStringPropertyConstraint,
  FilterProperty,
} from '../../shared/filters';
import { BookDto } from './bookDto';

export class FindBooksQueryDto {
  @IsOptional()
  @Validate(FilterHasStringPropertyConstraint, {})
  public readonly title?: FilterProperty<string>;

  @IsOptional()
  @Validate(FilterHasNumberPropertyConstraint, {})
  public readonly releaseYear?: FilterProperty<number>;

  @IsOptional()
  @Validate(FilterHasStringPropertyConstraint, {})
  public readonly language?: FilterProperty<BookLanguage>;

  @IsOptional()
  @Validate(FilterHasStringPropertyConstraint, {})
  public readonly format?: FilterProperty<BookFormat>;

  @IsOptional()
  @Validate(FilterHasNumberPropertyConstraint, {})
  public readonly price?: FilterProperty<number>;
}

export class FindBooksResponseData {
  public constructor(public readonly books: BookDto[]) {}
}

export class FindBooksResponseDto {
  public constructor(public readonly data: FindBooksResponseData, public readonly statusCode: number) {}
}
