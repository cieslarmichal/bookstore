import { IsString, IsUUID } from 'class-validator';

export class RemoveAuthorBookData {
  @IsString()
  @IsUUID('4')
  public authorId: string;

  @IsString()
  @IsUUID('4')
  public bookId: string;
}
