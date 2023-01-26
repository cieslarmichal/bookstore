/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, ManyToOne, Unique } from 'typeorm';

import { AuthorEntity } from '../../author/contracts/authorEntity';
import { BookEntity } from '../../book/contracts/bookEntity';

export const authorBooksTableName = 'authorBooks';

@Entity({
  name: authorBooksTableName,
})
@Unique('unique_index_authorId_bookId', ['authorId', 'bookId'])
export class AuthorBookEntity {
  @PrimaryGeneratedColumn('uuid')
  //@ts-ignore
  public id: string;

  @CreateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public updatedAt: Date;

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
