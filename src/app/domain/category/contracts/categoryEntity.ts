/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IsOptional, IsDate, IsString, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToMany } from 'typeorm';

import { BookCategoryEntity } from '../../bookCategory/contracts/bookCategoryEntity';

export const categoriesTableName = 'categories';

@Entity({
  name: categoriesTableName,
})
export class CategoryEntity {
  @IsOptional()
  @IsUUID('4')
  @PrimaryGeneratedColumn('uuid')
  //@ts-ignore
  public id: string;

  @IsOptional()
  @IsDate()
  @CreateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public createdAt: Date;

  @IsOptional()
  @IsDate()
  @UpdateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public updatedAt: Date;

  @IsString()
  @Column({ type: 'text', unique: true })
  //@ts-ignore
  public name: string;

  @IsOptional()
  @OneToMany(() => BookCategoryEntity, (bookCategory) => bookCategory.category)
  public bookCategories?: BookCategoryEntity[] | null;
}
