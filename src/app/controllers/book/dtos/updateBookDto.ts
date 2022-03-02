import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from 'src/app/shared';
import { BookDto } from './bookDto';

export class UpdateBookParamDto {
  @IsUUID('4')
  public readonly id: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(UpdateBookParamDto);
}

export class UpdateBookBodyDto {
  @IsString()
  @IsOptional()
  public readonly description?: string | null;

  @IsNumber()
  @IsOptional()
  public readonly price?: number;

  public static readonly create = RecordToInstanceTransformer.transformFactory(UpdateBookBodyDto);
}

export class UpdateBookResponseData {
  public constructor(public readonly book: BookDto) {}
}

export class UpdateBookResponseDto {
  public constructor(public readonly data: UpdateBookResponseData, public readonly statusCode: number) {}
}
