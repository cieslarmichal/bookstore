import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../shared';
import { BookDto } from '../../book/dtos';

export class AuthorDto {
  @IsNumber()
  public readonly id: number;

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

  @Type(() => BookDto)
  @ValidateNested({ each: true })
  public readonly books: BookDto[] | null;

  public static readonly create = RecordToInstanceTransformer.transformFactory(AuthorDto);
}
