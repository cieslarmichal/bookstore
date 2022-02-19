import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../shared';
import { BookFormat, BookLanguage } from '../types';

export class BookDto {
  @IsNumber()
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsString()
  public readonly title: string;

  @IsString()
  public readonly author: string;

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

  public static readonly create = RecordToInstanceTransformer.transformFactory(BookDto);
}
