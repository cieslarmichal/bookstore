import { IsOptional, IsDate, IsString, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToMany } from 'typeorm';
import { BookCategoryEntity } from '../../bookCategory/contracts/bookCategoryEntity';

export const CATEGORY_TABLE_NAME = 'categories';

@Entity({
  name: CATEGORY_TABLE_NAME,
})
export class CategoryEntity {
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
  @Column({ type: 'text', unique: true })
  public name: string;

  @IsOptional()
  @OneToMany(() => BookCategoryEntity, (bookCategory) => bookCategory.category)
  public bookCategories?: BookCategoryEntity[] | null;
}
