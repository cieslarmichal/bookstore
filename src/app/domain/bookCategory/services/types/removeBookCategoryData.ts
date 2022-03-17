import { IsString, IsUUID } from 'class-validator';

export class RemoveBookCategoryData {
  @IsString()
  @IsUUID('4')
  public bookId: string;

  @IsString()
  @IsUUID('4')
  public categoryId: string;
}
