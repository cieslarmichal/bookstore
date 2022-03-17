import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BookFormat, BookLanguage } from '../../types';

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
}
