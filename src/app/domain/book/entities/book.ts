import { IsOptional, IsDate, IsString, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, Unique, ManyToOne } from 'typeorm';
import { Author } from '../../author/entities/author';
import { BookFormat, BookLanguage } from '../types';

export const BOOK_TABLE_NAME = 'books';

@Entity({
  name: BOOK_TABLE_NAME,
})
@Unique('unique_index_title_author', ['title', 'authorId'])
export class Book {
  @IsOptional()
  @IsUUID('4')
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @IsOptional()
  @IsDate()
  @CreateDateColumn({ type: 'timestamp' })
  public createdAt: Date;

  @IsOptional()
  @IsDate()
  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt: Date;

  @IsString()
  @Column()
  public title: string;

  @IsNumber()
  @Column()
  public releaseYear: number;

  @IsEnum(BookLanguage)
  @Column()
  public language: BookLanguage;

  @IsEnum(BookFormat)
  @Column()
  public format: BookFormat;

  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  public description: string | null;

  @IsNumber()
  @Column()
  public price: number;

  @IsOptional()
  @ManyToOne(() => Author, (author) => author.books)
  public author: Author | null;

  @IsOptional()
  @IsUUID('4')
  @Column()
  public authorId: string;
}
