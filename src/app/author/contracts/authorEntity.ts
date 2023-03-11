/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';

import { AuthorBookEntity } from '../../authorBook/infrastructure/repositories/authorBookRepository/authorBookEntity/authorBookEntity';

export const authorTableName = 'authors';

@Entity({
  name: authorTableName,
})
export class AuthorEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public firstName: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public lastName: string;

  @Column({ type: 'text', nullable: true })
  public about?: string | null;

  @OneToMany(() => AuthorBookEntity, (authorBook) => authorBook.author)
  public authorBooks?: AuthorBookEntity[];
}
