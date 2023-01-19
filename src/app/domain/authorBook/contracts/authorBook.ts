import { IsDate, IsUUID } from 'class-validator';
import { RecordToInstanceTransformer } from '../../../common/transformer/recordToInstanceTransformer';

export class AuthorBook {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsUUID('4')
  public authorId: string;

  @IsUUID('4')
  public bookId: string;

  public static readonly create = RecordToInstanceTransformer.transformFactory(AuthorBook);
}
