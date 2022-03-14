import { IsOptional, IsString } from 'class-validator';

export class FindAuthorsData {
  @IsOptional()
  @IsString()
  public readonly firstName?: string;

  @IsOptional()
  @IsString()
  public readonly lastName?: string;
}
