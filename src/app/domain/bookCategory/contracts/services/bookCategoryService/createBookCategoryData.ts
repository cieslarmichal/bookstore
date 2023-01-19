import { IsString, IsUUID } from 'class-validator';

export class CreateBookCategoryData {
  @IsString()
  @IsUUID('4')
  public bookId: string;

  @IsString()
  @IsUUID('4')
  public categoryId: string;
}
