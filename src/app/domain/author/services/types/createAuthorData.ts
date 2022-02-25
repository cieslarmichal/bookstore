import { IsOptional, IsString } from 'class-validator';

export class CreateAuthorData {
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsString()
  @IsOptional()
  public about?: string;
}
