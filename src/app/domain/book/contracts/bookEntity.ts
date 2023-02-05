/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';

import { BookFormat } from './bookFormat';
import { BookLanguage } from './bookLanguage';
import { AuthorBookEntity } from '../../authorBook/contracts/authorBookEntity';
import { BookCategoryEntity } from '../../bookCategory/contracts/bookCategoryEntity';

export const booksTableName = 'books';

@Entity({
  name: booksTableName,
})
export class BookEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public title: string;

  @Column({ type: 'int' })
  //@ts-ignore
  public releaseYear: number;

  @Column({ type: 'enum', enum: BookLanguage })
  //@ts-ignore
  public language: BookLanguage;

  @Column({ type: 'enum', enum: BookFormat })
  //@ts-ignore
  public format: BookFormat;

  @Column({ type: 'float' })
  //@ts-ignore
  public price: number;

  @Column({ type: 'text', nullable: true })
  //@ts-ignore
  public description?: string;

  @OneToMany(() => AuthorBookEntity, (authorBook) => authorBook.book)
  public authorBooks?: AuthorBookEntity[];

  @OneToMany(() => BookCategoryEntity, (bookCategory) => bookCategory.book)
  public bookCategories?: BookCategoryEntity[];
}
