import { IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from 'src/app/shared';
import { BookDto } from './bookDto';

export class FindBookParamDto {
  @IsUUID('4')
  public readonly id: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(FindBookParamDto);
}

export class FindBookResponseData {
  public constructor(public readonly book: BookDto) {}
}

export class FindBookResponseDto {
  public constructor(public readonly data: FindBookResponseData, public readonly statusCode: number) {}
}
