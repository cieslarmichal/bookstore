/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, PrimaryColumn, Column, ManyToOne, Unique } from 'typeorm';

import { AuthorEntity } from '../../../../../author/contracts/authorEntity';
import { BookEntity } from '../../../../../domain/book/contracts/bookEntity';

export const authorBooksTableName = 'authorBooks';

@Entity({
  name: authorBooksTableName,
})
@Unique('unique_index_authorId_bookId', ['authorId', 'bookId'])
export class AuthorBookEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

  @ManyToOne(() => AuthorEntity, (author) => author.authorBooks, { onDelete: 'CASCADE' })
  public author?: AuthorEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public authorId: string;

  @ManyToOne(() => BookEntity, (book) => book.authorBooks, { onDelete: 'CASCADE' })
  public book?: BookEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public bookId: string;
}
