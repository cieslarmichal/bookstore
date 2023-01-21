import { IsOptional, IsNumber } from 'class-validator';

export class PaginationDataTemplate {
  @IsOptional()
  @IsNumber()
  public readonly page?: number;

  @IsOptional()
  @IsNumber()
  public readonly limit?: number;
}
