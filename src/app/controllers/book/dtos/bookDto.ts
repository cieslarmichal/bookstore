import { IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../common';
import { BookFormat, BookLanguage } from '../../../domain/book/types';

export class BookDto {
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
  public readonly description?: string | null;

  @IsNumber()
  public readonly price: number;

  public static readonly create = RecordToInstanceTransformer.transformFactory(BookDto);
}
