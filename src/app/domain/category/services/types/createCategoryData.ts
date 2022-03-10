import { IsString } from 'class-validator';

export class CreateCategoryData {
  @IsString()
  public name: string;
}
