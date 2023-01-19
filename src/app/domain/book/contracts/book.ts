import { IsOptional, IsDate, IsString, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToMany } from 'typeorm';
import { AuthorBookEntity } from '../../authorBook/contracts/authorBookEntity';
import { BookCategory } from '../../bookCategory/entities/bookCategory';
import { BookFormat } from './bookFormat';
import { BookLanguage } from './bookLanguage';

export const BOOK_TABLE_NAME = 'books';

@Entity({
  name: BOOK_TABLE_NAME,
})
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
  @OneToMany(() => AuthorBookEntity, (authorBook) => authorBook.book)
  public authorBooks?: AuthorBookEntity[] | null;

  @IsOptional()
  @OneToMany(() => BookCategory, (bookCategory) => bookCategory.book)
  public bookCategories?: BookCategory[] | null;
}
