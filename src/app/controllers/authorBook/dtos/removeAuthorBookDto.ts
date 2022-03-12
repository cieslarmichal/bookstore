import { IsUUID } from 'class-validator';

export class RemoveAuthorBookParamDto {
  @IsUUID('4')
  public readonly authorId: string;

  @IsUUID('4')
  public readonly bookId: string;
}

export class RemoveAuthorBookResponseDto {
  public constructor(public readonly statusCode: number) {}
}
