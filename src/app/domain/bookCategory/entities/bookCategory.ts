import { IsOptional, IsDate, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Book } from '../../book/entities/book';
import { Category } from '../../category/entities/category';

export const BOOK_CATEGORY_TABLE_NAME = 'bookCategories';

@Entity({
  name: BOOK_CATEGORY_TABLE_NAME,
})
@Unique('unique_index_bookId_categoryId', ['bookId', 'categoryId'])
export class BookCategory {
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

  @ManyToOne(() => Book, (book) => book.bookCategories, { onDelete: 'CASCADE' })
  public book?: Book;

  @IsOptional()
  @IsUUID('4')
  @Column({ type: 'uuid' })
  public bookId: string;

  @ManyToOne(() => Category, (category) => category.bookCategories, { onDelete: 'CASCADE' })
  public category?: Category;

  @IsOptional()
  @IsUUID('4')
  @Column({ type: 'uuid' })
  public categoryId: string;
}
