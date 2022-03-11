import { IsDate, IsString, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../shared';

export class CategoryDto {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsString()
  public readonly name: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(CategoryDto);
}
