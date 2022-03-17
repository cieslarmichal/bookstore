import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BookFormat, BookLanguage } from '../../../domain/book/types';
import { BookDto } from './bookDto';

export class CreateBookBodyDto {
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
  public readonly description?: string | null;

  @IsNumber()
  public readonly price: number;
}

export class CreateBookResponseData {
  public constructor(public readonly book: BookDto) {}
}

export class CreateBookResponseDto {
  public constructor(public readonly data: CreateBookResponseData, public readonly statusCode: number) {}
}
