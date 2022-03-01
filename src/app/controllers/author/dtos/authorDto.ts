import { BookDto } from './../../../domain/book/dtos/bookDto';

export class AuthorDto {
  public readonly id: string;

  public readonly createdAt: Date;

  public readonly updatedAt: Date;

  public readonly firstName: string;

  public readonly lastName: string;

  public readonly about?: string | null;

  public readonly books: BookDto[] | null;
}
