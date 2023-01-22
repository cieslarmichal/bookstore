import { IsUuidV4, IsString } from '../../../../../common/validator/decorators';
import { Validator } from '../../../../../common/validator/validator';

export class RemoveAuthorBookData {
  @IsString()
  @IsUuidV4()
  public authorId: string;

  @IsString()
  @IsUuidV4()
  public bookId: string;

  public constructor({ authorId, bookId }: RemoveAuthorBookData) {
    this.authorId = authorId;
    this.bookId = bookId;

    Validator.validate(this);
  }
}
