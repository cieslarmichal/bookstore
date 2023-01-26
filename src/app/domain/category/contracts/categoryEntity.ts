/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToMany } from 'typeorm';

import { BookCategoryEntity } from '../../bookCategory/contracts/bookCategoryEntity';

export const categoriesTableName = 'categories';

@Entity({
  name: categoriesTableName,
})
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  //@ts-ignore
  public id: string;

  @CreateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public updatedAt: Date;

  @Column({ type: 'text', unique: true })
  //@ts-ignore
  public name: string;

  @OneToMany(() => BookCategoryEntity, (bookCategory) => bookCategory.category)
  public bookCategories?: BookCategoryEntity[] | null;
}
