import { IsOptional } from 'class-validator';
import { FilterNumberProperty, FilterStringProperty } from '../../../shared';

export class FindBooksData {
  @IsOptional()
  public readonly title?: FilterStringProperty;

  @IsOptional()
  public readonly releaseYear?: FilterNumberProperty;

  @IsOptional()
  public readonly language?: FilterStringProperty;

  @IsOptional()
  public readonly format?: FilterStringProperty;

  @IsOptional()
  public readonly price?: FilterNumberProperty;
}
