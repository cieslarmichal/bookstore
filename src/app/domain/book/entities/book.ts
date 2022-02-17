import {
  IsUUID,
  IsOptional,
  IsDate,
  IsString,
  IsNumber,
} from 'class-validator';
import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

export const BOOK_TABLE_NAME = 'books';

@Entity({
  name: BOOK_TABLE_NAME,
})
export class Book {
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

  @IsOptional()
  @IsString()
  @Column({ type: 'text' })
  public title: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'text' })
  public author: string;

  @IsOptional()
  @IsNumber()
  @Column({ type: 'number' })
  public releaseYear: number;

  @IsOptional()
  @IsString()
  @Column({ type: 'text' })
  public language: string | null;

  // kindle/paperback/hardcover
  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  public format: string | null;

  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  public description: string | null;

  @IsOptional()
  @IsNumber()
  @Column({ type: 'number' })
  public price: number;
}
