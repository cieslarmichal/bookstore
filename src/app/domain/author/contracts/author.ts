import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../common/transformer/recordToInstanceTransformer';
import { BookDto } from '../../book/dtos';

export class Author {
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

  @Type(() => BookDto)
  @ValidateNested({ each: true })
  @IsOptional()
  public readonly books: BookDto[] | null;

  public static readonly create = RecordToInstanceTransformer.transformFactory(Author);
}
