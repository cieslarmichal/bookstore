/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IsOptional, IsDate, IsString, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToMany } from 'typeorm';

import { BookFormat } from './bookFormat';
import { BookLanguage } from './bookLanguage';
import { AuthorBookEntity } from '../../authorBook/contracts/authorBookEntity';
import { BookCategoryEntity } from '../../bookCategory/contracts/bookCategoryEntity';

export const booksTableName = 'books';

@Entity({
  name: booksTableName,
})
export class BookEntity {
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

  @IsString()
  @Column()
  //@ts-ignore
  public title: string;

  @IsNumber()
  @Column()
  //@ts-ignore
  public releaseYear: number;

  @IsEnum(BookLanguage)
  @Column()
  //@ts-ignore
  public language: BookLanguage;

  @IsEnum(BookFormat)
  @Column()
  //@ts-ignore
  public format: BookFormat;

  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  //@ts-ignore
  public description: string | null;

  @IsNumber()
  @Column()
  //@ts-ignore
  public price: number;

  @IsOptional()
  @OneToMany(() => AuthorBookEntity, (authorBook) => authorBook.book)
  public authorBooks?: AuthorBookEntity[] | null;

  @IsOptional()
  @OneToMany(() => BookCategoryEntity, (bookCategory) => bookCategory.book)
  public bookCategories?: BookCategoryEntity[] | null;
}
