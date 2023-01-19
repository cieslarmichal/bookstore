import { IsString, IsUUID } from 'class-validator';

export class CreateAuthorBookData {
  @IsString()
  @IsUUID('4')
  public authorId: string;

  @IsString()
  @IsUUID('4')
  public bookId: string;
}
