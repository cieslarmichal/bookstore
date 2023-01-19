import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../common';
import { Book } from '../../../domain/book/contracts/book';

export class AuthorDto {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsString()
  public readonly firstName: string;

  @IsString()
  public readonly lastName: string;

  @IsString()
  @IsOptional()
  public readonly about?: string | null;

  @IsOptional()
  public readonly books: Book[] | null;

  public static readonly create = RecordToInstanceTransformer.transformFactory(AuthorDto);
}
