import { IsOptional } from 'class-validator';
import { FilterProperty } from '../../../../common/filterProperty';

export class FindBooksData {
  @IsOptional()
  public readonly title?: FilterProperty;

  @IsOptional()
  public readonly releaseYear?: FilterProperty;

  @IsOptional()
  public readonly language?: FilterProperty;

  @IsOptional()
  public readonly format?: FilterProperty;

  @IsOptional()
  public readonly price?: FilterProperty;
}
