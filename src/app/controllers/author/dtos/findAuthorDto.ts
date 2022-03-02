import { Allow, IsNumber, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from 'src/app/shared';
import { AuthorDto } from './authorDto';

export class FindAuthorParamDto {
  @IsUUID('4')
  public readonly id: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(FindAuthorParamDto);
}

export class FindAuthorResponseData {
  @Allow()
  public readonly author: AuthorDto;

  public static readonly create = RecordToInstanceTransformer.transformFactory(FindAuthorResponseData);
}

export class FindAuthorResponseDto {
  @Allow()
  public readonly data: FindAuthorResponseData;

  @IsNumber()
  public readonly statusCode: number;

  public static readonly create = RecordToInstanceTransformer.transformFactory(FindAuthorResponseDto);
}
