/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IsOptional, IsDate, IsString, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToMany } from 'typeorm';

import { AuthorBookEntity } from '../../authorBook/contracts/authorBookEntity';

export const authorTableName = 'authors';

@Entity({
  name: authorTableName,
})
export class AuthorEntity {
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
  @Column()
  //@ts-ignore
  public firstName: string;

  @IsString()
  @Column()
  //@ts-ignore
  public lastName: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  public about?: string | undefined;

  @IsOptional()
  @OneToMany(() => AuthorBookEntity, (authorBook) => authorBook.author)
  public authorBooks?: AuthorBookEntity[] | null;
}
