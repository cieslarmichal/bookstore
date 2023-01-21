import { IsOptional, IsString } from 'class-validator';

export class UpdateAuthorData {
  @IsString()
  @IsOptional()
  public about?: string | undefined;
}
