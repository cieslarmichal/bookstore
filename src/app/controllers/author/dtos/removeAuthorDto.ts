import { IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from 'src/app/shared';

export class RemoveAuthorParamDto {
  @IsUUID('4')
  public readonly id: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(RemoveAuthorParamDto);
}

export class RemoveAuthorResponseDto {
  public readonly statusCode: number;

  public static readonly create = RecordToInstanceTransformer.transformFactory(RemoveAuthorResponseDto);
}
