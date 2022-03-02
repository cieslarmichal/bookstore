import { IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from 'src/app/shared';
import { AuthorDto } from './authorDto';

export class FindAuthorParamDto {
  @IsUUID('4')
  public readonly id: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(FindAuthorParamDto);
}

export class FindAuthorResponseData {
  public constructor(public readonly author: AuthorDto) {}
}

export class FindAuthorResponseDto {
  public constructor(public readonly data: FindAuthorResponseData, public readonly statusCode: number) {}
}
