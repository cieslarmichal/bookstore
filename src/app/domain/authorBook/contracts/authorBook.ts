import { IsUuidV4 } from '../../../common/validator/decorators';
import { Validator } from '../../../common/validator/validator';

export class AuthorBook {
  @IsUuidV4()
  public readonly id: string;

  @IsUuidV4()
  public authorId: string;

  @IsUuidV4()
  public bookId: string;

  public constructor({ id, authorId, bookId }: AuthorBook) {
    this.id = id;
    this.authorId = authorId;
    this.bookId = bookId;

    Validator.validate(this);
  }
}
