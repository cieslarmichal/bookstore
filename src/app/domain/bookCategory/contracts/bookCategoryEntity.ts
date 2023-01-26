/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, ManyToOne, Unique } from 'typeorm';

import { BookEntity } from '../../book/contracts/bookEntity';
import { CategoryEntity } from '../../category/contracts/categoryEntity';

export const bookCategoriesTableName = 'bookCategories';

@Entity({
  name: bookCategoriesTableName,
})
@Unique('unique_index_bookId_categoryId', ['bookId', 'categoryId'])
export class BookCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  //@ts-ignore
  public id: string;

  @CreateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public updatedAt: Date;

  @ManyToOne(() => BookEntity, (book) => book.bookCategories, { onDelete: 'CASCADE' })
  public book?: BookEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public bookId: string;

  @ManyToOne(() => CategoryEntity, (category) => category.bookCategories, { onDelete: 'CASCADE' })
  public category?: CategoryEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public categoryId: string;
}
