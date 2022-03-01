import { IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from 'src/app/shared';
import { AuthorDto } from './authorDto';

export class RemoveAuthorParamDto {
  @IsUUID('4')
  public readonly id: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(RemoveAuthorParamDto);
}

export class RemoveAuthorResponseDto {
  public readonly author: AuthorDto;
}
