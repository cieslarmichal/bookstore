import { IsOptional, IsDate, IsString, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToMany } from 'typeorm';
import { BookCategory } from '../../bookCategory/entities/bookCategory';

export const CATEGORY_TABLE_NAME = 'categories';

@Entity({
  name: CATEGORY_TABLE_NAME,
})
export class Category {
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
  @OneToMany(() => BookCategory, (bookCategory) => bookCategory.category)
  public bookCategories?: BookCategory[] | null;
}
