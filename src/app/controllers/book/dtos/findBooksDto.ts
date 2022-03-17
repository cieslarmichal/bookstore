import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BookFormat, BookLanguage } from '../../../domain/book/types';
import { BookDto } from './bookDto';

export class FindBooksQueryDto {
  @IsOptional()
  @IsString()
  public readonly title?: string;

  @IsOptional()
  @IsNumber()
  public releaseYear?: number;

  @IsOptional()
  @IsEnum(BookLanguage)
  public language?: BookLanguage;

  @IsOptional()
  @IsEnum(BookFormat)
  public format?: BookFormat;

  @IsOptional()
  @IsNumber()
  public price?: number;
}

export class FindBooksResponseData {
  public constructor(public readonly books: BookDto[]) {}
}

export class FindBooksResponseDto {
  public constructor(public readonly data: FindBooksResponseData, public readonly statusCode: number) {}
}
