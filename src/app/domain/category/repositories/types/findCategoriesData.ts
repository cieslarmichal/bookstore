import { IsOptional } from 'class-validator';
import { FilterProperty } from '../../../shared';

export class FindCategoriesData {
  @IsOptional()
  public readonly name?: FilterProperty;
}
