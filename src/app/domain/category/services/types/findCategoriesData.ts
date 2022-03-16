import { IsOptional, IsString } from 'class-validator';

export class FindCategoriesData {
  @IsOptional()
  @IsString()
  public readonly name?: string;
}
