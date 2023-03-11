/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, Column, ManyToOne, Unique, PrimaryColumn } from 'typeorm';

import { BookEntity } from '../../book/contracts/bookEntity';
import { CategoryEntity } from '../../categoryModule/infrastructure/repositories/categoryRepository/categoryEntity/categoryEntity';

export const bookCategoriesTableName = 'bookCategories';

@Entity({
  name: bookCategoriesTableName,
})
@Unique('unique_index_bookId_categoryId', ['bookId', 'categoryId'])
export class BookCategoryEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

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
