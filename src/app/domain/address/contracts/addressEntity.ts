import { IsOptional, IsDate, IsString, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column, ManyToOne } from 'typeorm';
import { Customer } from '../../customer/entities/customer';

export const ADDRESS_TABLE_NAME = 'addresses';

@Entity({
  name: ADDRESS_TABLE_NAME,
})
export class AddressEntity {
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

  @IsString()
  @Column()
  public phoneNumber: string;

  @IsString()
  @Column()
  public country: string;

  @IsString()
  @Column()
  public state: string;

  @IsString()
  @Column()
  public city: string;

  @IsString()
  @Column()
  public zipCode: string;

  @IsString()
  @Column()
  public streetAddress: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  public deliveryInstructions: string | null;

  @IsOptional()
  @ManyToOne(() => Customer, (customer) => customer.addresses, { onDelete: 'CASCADE' })
  public customer?: Customer | null;

  @IsOptional()
  @IsUUID('4')
  @Column({ type: 'uuid' })
  public customerId: string;
}
