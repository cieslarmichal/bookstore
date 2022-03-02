import { Allow, IsNumber, IsOptional, IsString } from 'class-validator';
import { RecordToInstanceTransformer } from 'src/app/shared';
import { AuthorDto } from './authorDto';

export class CreateAuthorBodyDto {
  @IsString()
  public readonly firstName: string;

  @IsString()
  public readonly lastName: string;

  @IsString()
  @IsOptional()
  public readonly about?: string | null;

  public static readonly create = RecordToInstanceTransformer.transformFactory(CreateAuthorBodyDto);
}

export class CreateAuthorResponseData {
  @Allow()
  public readonly author: AuthorDto;

  public static readonly create = RecordToInstanceTransformer.transformFactory(CreateAuthorResponseData);
}

export class CreateAuthorResponseDto {
  @Allow()
  public readonly data: CreateAuthorResponseData;

  @IsNumber()
  public readonly statusCode: number;

  public static readonly create = RecordToInstanceTransformer.transformFactory(CreateAuthorResponseDto);
}
