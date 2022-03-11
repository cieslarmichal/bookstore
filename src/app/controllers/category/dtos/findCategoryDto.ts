import { IsUUID } from 'class-validator';
import { CategoryDto } from './categoryDto';

export class FindCategoryParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class FindCategoryResponseData {
  public constructor(public readonly category: CategoryDto) {}
}

export class FindCategoryResponseDto {
  public constructor(public readonly data: FindCategoryResponseData, public readonly statusCode: number) {}
}
