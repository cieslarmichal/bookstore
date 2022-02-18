import {
  IsOptional,
  IsDate,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  Unique,
} from 'typeorm';
import { BookFormat, BookLanguage } from '../types';

export const BOOK_TABLE_NAME = 'books';

@Entity({
  name: BOOK_TABLE_NAME,
})
@Unique('index_title_author', ['title', 'author'])
export class Book {
  @IsOptional()
  @PrimaryGeneratedColumn('increment')
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
  @Column({ type: 'text', unique: true })
  public title: string;

  @IsString()
  @Column()
  public author: string;

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
}
