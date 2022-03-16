import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { BookFormat, BookLanguage } from '../../types';

export class FindBooksData {
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

  @IsOptional()
  @IsUUID('4')
  public categoryId?: string;
}
