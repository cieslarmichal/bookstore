import { IsOptional, IsDate, IsString, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToMany } from 'typeorm';
import { AuthorBookEntity } from '../../authorBook/contracts/authorBookEntity';

export const AUTHOR_TABLE_NAME = 'authors';

@Entity({
  name: AUTHOR_TABLE_NAME,
})
export class AuthorEntity {
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

  @IsOptional()
  @OneToMany(() => AuthorBookEntity, (authorBook) => authorBook.author)
  public authorBooks?: AuthorBookEntity[] | null;
}
