import { IsOptional } from 'class-validator';
import { FilterProperty } from '../../../../common/filterProperty';

export class FindCategoriesData {
  @IsOptional()
  public readonly name?: FilterProperty;
}
