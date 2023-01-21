import { IsNumber } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../common/transformer/recordToInstanceTransformer';

export class PaginationData {
  @IsNumber()
  public page: number;

  @IsNumber()
  public limit: number;

  public static readonly create = RecordToInstanceTransformer.transformFactory(PaginationData);
}
