import { IsDate, IsUUID } from 'class-validator';

import { Validator } from '../../../common/validator/validator';

export class BookCategory {
  @IsUUID('4')
  public readonly id: string;

  @IsDate()
  public readonly createdAt: Date;

  @IsDate()
  public readonly updatedAt: Date;

  @IsUUID('4')
  public bookId: string;

  @IsUUID('4')
  public categoryId: string;

  public constructor({ id, createdAt, updatedAt, bookId, categoryId }: BookCategory) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.bookId = bookId;
    this.categoryId = categoryId;

    Validator.validate(this);
  }
}
