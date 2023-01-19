import { IsOptional, IsDate, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, ManyToOne, Unique } from 'typeorm';
import { BookEntity } from '../../book/contracts/bookEntity';
import { CategoryEntity } from '../../category/contracts/categoryEntity';

export const BOOK_CATEGORY_TABLE_NAME = 'bookCategories';

@Entity({
  name: BOOK_CATEGORY_TABLE_NAME,
})
@Unique('unique_index_bookId_categoryId', ['bookId', 'categoryId'])
export class BookCategoryEntity {
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

  @ManyToOne(() => BookEntity, (book) => book.bookCategories, { onDelete: 'CASCADE' })
  public book?: BookEntity;

  @IsOptional()
  @IsUUID('4')
  @Column({ type: 'uuid' })
  public bookId: string;

  @ManyToOne(() => CategoryEntity, (category) => category.bookCategories, { onDelete: 'CASCADE' })
  public category?: CategoryEntity;

  @IsOptional()
  @IsUUID('4')
  @Column({ type: 'uuid' })
  public categoryId: string;
}
