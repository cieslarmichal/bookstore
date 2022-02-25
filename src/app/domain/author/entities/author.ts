import { IsOptional, IsDate, IsString } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, Unique, OneToMany } from 'typeorm';
import { Book } from '../../book/entities/book';

export const AUTHOR_TABLE_NAME = 'authors';

@Entity({
  name: AUTHOR_TABLE_NAME,
})
@Unique('unique_index_first_name_last_name', ['firstName', 'lastName'])
export class Author {
  @IsOptional()
  @PrimaryGeneratedColumn('increment')
  public id: number;

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
