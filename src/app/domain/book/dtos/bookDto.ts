import { IsString } from 'class-validator';

export class BookDto {
  @IsUUID('4')
  readonly id: string;

  @IsString()
  readonly title: string;

  @IsString()
  readonly author: string;

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
