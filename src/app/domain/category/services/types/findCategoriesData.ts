import { IsOptional } from 'class-validator';
import { FilterProperty } from '../../../common';

export class FindCategoriesData {
  @IsOptional()
  public readonly name?: FilterProperty;
}
