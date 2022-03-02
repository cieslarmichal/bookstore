import { IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from 'src/app/shared';

export class RemoveBookParamDto {
  @IsUUID('4')
  public readonly id: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(RemoveBookParamDto);
}

export class RemoveBookResponseDto {
  public constructor(public readonly statusCode: number) {}
}
