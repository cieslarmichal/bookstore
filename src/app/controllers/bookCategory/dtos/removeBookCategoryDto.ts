import { IsUUID } from 'class-validator';

export class RemoveBookCategoryParamDto {
  @IsUUID('4')
  public readonly bookId: string;

  @IsUUID('4')
  public readonly categoryId: string;
}

export class RemoveBookCategoryResponseDto {
  public constructor(public readonly statusCode: number) {}
}
