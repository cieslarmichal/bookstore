/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';

import { BookCategoryEntity } from '../../../../../bookCategory/contracts/bookCategoryEntity';

export const categoriesTableName = 'categories';

@Entity({
  name: categoriesTableName,
})
export class CategoryEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

  @Column({ type: 'text', unique: true })
  //@ts-ignore
  public name: string;

  @OneToMany(() => BookCategoryEntity, (bookCategory) => bookCategory.category)
  public bookCategories?: BookCategoryEntity[];
}
