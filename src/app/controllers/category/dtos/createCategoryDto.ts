import { IsString } from 'class-validator';
import { CategoryDto } from './categoryDto';

export class CreateCategoryBodyDto {
  @IsString()
  public readonly name: string;
}

export class CreateCategoryResponseData {
  public constructor(public readonly category: CategoryDto) {}
}

export class CreateCategoryResponseDto {
  public constructor(public readonly data: CreateCategoryResponseData, public readonly statusCode: number) {}
}
