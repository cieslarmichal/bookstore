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
  Unique,
} from 'typeorm';

export const BOOK_TABLE_NAME = 'books';

@Entity({
  name: BOOK_TABLE_NAME,
})
@Unique('index_title_author', ['title', 'author'])
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
  @Column({ type: 'text', unique: true })
  public title: string;

  @IsOptional()
  @IsString()
  @Column()
  public author: string;

  @IsOptional()
  @IsNumber()
  @Column()
  public releaseYear: number;

  @IsOptional()
  @IsString()
  @Column()
  public language: string;

  @IsOptional()
  @IsString()
  @Column()
  public format: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  public description: string | null;

  @IsOptional()
  @IsNumber()
  @Column()
  public price: number;
}
