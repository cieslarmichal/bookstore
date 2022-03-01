import { IsOptional, IsString } from 'class-validator';
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

export class CreateAuthorResponseDto {
  public readonly author: AuthorDto;
}
