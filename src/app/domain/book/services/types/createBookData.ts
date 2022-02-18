import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBookData {
  @IsString()
  public title: string;

  @IsString()
  public author: string;

  @IsNumber()
  public releaseYear: number;

  @IsString()
  public language: string;

  @IsString()
  public format: string;

  @IsString()
  @IsOptional()
  public description?: string;

  @IsNumber()
  public price: number;
}
