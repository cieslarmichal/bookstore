import { IsUUID } from 'class-validator';
import { BookDto } from './bookDto';

export class FindBookParamDto {
  @IsUUID('4')
  public readonly id: string;
}

export class FindBookResponseData {
  public constructor(public readonly book: BookDto) {}
}

export class FindBookResponseDto {
  public constructor(public readonly data: FindBookResponseData, public readonly statusCode: number) {}
}
