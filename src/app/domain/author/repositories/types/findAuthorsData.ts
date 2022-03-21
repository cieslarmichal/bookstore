import { IsOptional } from 'class-validator';
import { FilterProperty } from '../../../shared';

export class FindAuthorsData {
  @IsOptional()
  public readonly firstName?: FilterProperty;

  @IsOptional()
  public readonly lastName?: FilterProperty;
}
