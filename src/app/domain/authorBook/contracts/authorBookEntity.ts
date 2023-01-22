/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IsOptional, IsDate, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, ManyToOne, Unique } from 'typeorm';

import { AuthorEntity } from '../../author/contracts/authorEntity';
import { BookEntity } from '../../book/contracts/bookEntity';

export const authorBooksTableName = 'authorBooks';

@Entity({
  name: authorBooksTableName,
})
@Unique('unique_index_authorId_bookId', ['authorId', 'bookId'])
export class AuthorBookEntity {
  @IsOptional()
  @IsUUID('4')
  @PrimaryGeneratedColumn('uuid')
  //@ts-ignore
  public id: string;

  @IsOptional()
  @IsDate()
  @CreateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public createdAt: Date;

  @IsOptional()
  @IsDate()
  @UpdateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public updatedAt: Date;

  @ManyToOne(() => AuthorEntity, (author) => author.authorBooks, { onDelete: 'CASCADE' })
  public author?: AuthorEntity;

  @IsOptional()
  @IsUUID('4')
  @Column({ type: 'uuid' })
  //@ts-ignore
  public authorId: string;

  @ManyToOne(() => BookEntity, (book) => book.authorBooks, { onDelete: 'CASCADE' })
  public book?: BookEntity;

  @IsOptional()
  @IsUUID('4')
  @Column({ type: 'uuid' })
  //@ts-ignore
  public bookId: string;
}
