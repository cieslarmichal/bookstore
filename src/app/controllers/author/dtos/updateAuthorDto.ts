import { IsOptional, IsString, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from 'src/app/shared';
import { AuthorDto } from './authorDto';

export class UpdateAuthorParamDto {
  @IsUUID('4')
  public readonly id: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(UpdateAuthorParamDto);
}

export class UpdateAuthorBodyDto {
  @IsString()
  @IsOptional()
  public readonly about?: string | null;

  public static readonly create = RecordToInstanceTransformer.transformFactory(UpdateAuthorBodyDto);
}

export class UpdateAuthorResponseData {
  public readonly author: AuthorDto;

  public static readonly create = RecordToInstanceTransformer.transformFactory(UpdateAuthorResponseData);
}

export class UpdateAuthorResponseDto {
  public readonly data: UpdateAuthorResponseData;
  public readonly statusCode: number;

  public static readonly create = RecordToInstanceTransformer.transformFactory(UpdateAuthorResponseDto);
}
