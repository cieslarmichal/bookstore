import { IsOptional, IsDate, IsString, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToMany } from 'typeorm';
import { Book } from '../../book/entities/book';

export const AUTHOR_TABLE_NAME = 'authors';

@Entity({
  name: AUTHOR_TABLE_NAME,
})
export class Author {
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
  @Column()
  public firstName: string;

  @IsString()
  @Column()
  public lastName: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  public about: string | null;

  @OneToMany(() => Book, (book) => book.author)
  public books?: Book[];
}
