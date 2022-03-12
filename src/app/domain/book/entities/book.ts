import { IsOptional, IsDate, IsString, IsNumber, IsEnum, IsUUID } from 'class-validator';
import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AuthorBook } from '../../authorBook/entities/authorBook';
import { Category } from '../../category/entities/category';
import { BookFormat, BookLanguage } from '../types';

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
  @OneToMany(() => AuthorBook, (authorBook) => authorBook.book)
  public authorBooks?: AuthorBook[] | null;

  @IsOptional()
  @ManyToOne(() => Category)
  public category: Category | null;

  @IsOptional()
  @IsUUID('4')
  @Column()
  public categoryId: string;
}
