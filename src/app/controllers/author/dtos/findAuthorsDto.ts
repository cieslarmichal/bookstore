import { IsOptional, Validate } from 'class-validator';
import { FilterHasStringPropertyConstraint, FilterProperty } from '../../shared';
import { AuthorDto } from './authorDto';

export class FindAuthorsQueryDto {
  @IsOptional()
  @Validate(FilterHasStringPropertyConstraint, {})
  public readonly firstName?: FilterProperty<string>;

  @IsOptional()
  @Validate(FilterHasStringPropertyConstraint, {})
  public readonly lastName?: FilterProperty<string>;
}

export class FindAuthorsResponseData {
  public constructor(public readonly authors: AuthorDto[]) {}
}

export class FindAuthorsResponseDto {
  public constructor(public readonly data: FindAuthorsResponseData, public readonly statusCode: number) {}
}
