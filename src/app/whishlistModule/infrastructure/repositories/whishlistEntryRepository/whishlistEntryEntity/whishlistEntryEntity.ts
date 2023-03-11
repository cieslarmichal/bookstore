/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';

import { BookEntity } from '../../../../../bookModule/infrastructure/repositories/bookRepository/bookEntity/bookEntity';
import { CustomerEntity } from '../../../../../customerModule/infrastructure/repositories/customerRepository/customerEntity/customerEntity';

export const whishlistEntriesTableName = 'whishlistEntries';

@Entity({
  name: whishlistEntriesTableName,
})
@Unique('unique_bookId_customerId', ['bookId', 'customerId'])
export class WhishlistEntryEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

  @ManyToOne(() => BookEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId', referencedColumnName: 'id' })
  public book?: BookEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public bookId: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  public customer?: CustomerEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public customerId: string;
}
