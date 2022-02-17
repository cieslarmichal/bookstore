import { IsString } from 'class-validator';

export class BookDto {
  @IsString()
  readonly title: string;
}
