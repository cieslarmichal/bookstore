/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, OneToOne, JoinColumn, Column, PrimaryColumn } from 'typeorm';

import { BookEntity } from '../../book/contracts/bookEntity';

export const inventoriesTableName = 'inventories';

@Entity({
  name: inventoriesTableName,
})
export class InventoryEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

  @OneToOne(() => BookEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookId', referencedColumnName: 'id' })
  //@ts-ignore
  public book?: BookEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public bookId: string;

  @Column({ type: 'int' })
  //@ts-ignore
  public quantity: number;
}
