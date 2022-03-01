import { IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from 'src/app/shared';
import { AuthorDto } from './authorDto';

export class FindAuthorParamDto {
  @IsUUID('4')
  public readonly id: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(FindAuthorParamDto);
}

export class FindAuthorResponseDto {
  public readonly author: AuthorDto;
}
