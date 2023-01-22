import { IsDate, IsUuidV4 } from '../../../common/validator/decorators';
import { Validator } from '../../../common/validator/validator';

export class AuthorBook {
  @IsUuidV4()
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsUuidV4()
  public authorId: string;

  @IsUuidV4()
  public bookId: string;

  public constructor({ id, createdAt, updatedAt, authorId, bookId }: AuthorBook) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.authorId = authorId;
    this.bookId = bookId;

    Validator.validate(this);
  }
}
