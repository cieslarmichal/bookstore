import { IsNumber } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../shared';

export class PaginationData {
  @IsNumber()
  public page: number;

  @IsNumber()
  public limit: number;

  public static readonly create = RecordToInstanceTransformer.transformFactory(PaginationData);
}
