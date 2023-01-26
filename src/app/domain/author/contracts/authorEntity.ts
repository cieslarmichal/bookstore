/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, OneToMany } from 'typeorm';

import { AuthorBookEntity } from '../../authorBook/contracts/authorBookEntity';

export const authorTableName = 'authors';

@Entity({
  name: authorTableName,
})
export class AuthorEntity {
  @PrimaryGeneratedColumn('uuid')
  //@ts-ignore
  public id: string;

  @CreateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  //@ts-ignore
  public updatedAt: Date;

  @Column({ type: 'text' })
  //@ts-ignore
  public firstName: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public lastName: string;

  @Column({ type: 'text', nullable: true })
  public about?: string | undefined;

  @OneToMany(() => AuthorBookEntity, (authorBook) => authorBook.author)
  public authorBooks?: AuthorBookEntity[] | null;
}
