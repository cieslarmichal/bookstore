import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { RecordToInstanceTransformer } from 'src/app/shared';
import { BookFormat, BookLanguage } from '../types';

export class BookDto {
  @IsUUID('4')
  public readonly id: string;

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
  public readonly description?: string;

  @IsNumber()
  public readonly price: number;

  public static create = RecordToInstanceTransformer.transformFactory(BookDto);
}
