import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

import { IsInstanceOf } from '../../../common/validator/decorators';
import { Validator } from '../../../common/validator/validator';
import { Book } from '../../book/contracts/book';

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

  @IsOptional()
  @IsString()
  public readonly about?: string | undefined;

  @IsOptional()
  @IsInstanceOf(Book, { each: true })
  public readonly books?: Book[] | null;

  public constructor({ id, createdAt, updatedAt, firstName, lastName, about, books }: Author) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.firstName = firstName;
    this.lastName = lastName;

    if (about) {
      this.about = about;
    }

    if (books) {
      this.books = books;
    }

    Validator.validate(this);
  }
}
