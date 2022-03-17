import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BookFormat, BookLanguage } from '../../types';

export class FindBooksData {
  @IsOptional()
  @IsString()
  public readonly title?: string;

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
