/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

import { CustomerEntity } from '../../customer/contracts/customerEntity';

export const reviewsTableName = 'reviews';

@Entity({
  name: reviewsTableName,
})
export class ReviewEntity {
  @PrimaryColumn({ type: 'uuid' })
  //@ts-ignore
  public id: string;

  @Column({ type: 'text' })
  //@ts-ignore
  public isbn: string;

  @Column({ type: 'int' })
  //@ts-ignore
  public rate: number;

  @Column({ type: 'text', nullable: true })
  //@ts-ignore
  public comment?: string | null;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId', referencedColumnName: 'id' })
  public customer?: CustomerEntity;

  @Column({ type: 'uuid' })
  //@ts-ignore
  public customerId: string;
}
