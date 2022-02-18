import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBookData {
  @IsString()
  @IsOptional()
  public description?: string;

  @IsNumber()
  @IsOptional()
  public price?: number;
}
