import { IsOptional, IsDate, IsString, IsUUID } from 'class-validator';
import { Entity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column } from 'typeorm';

export const ADDRESS_TABLE_NAME = 'addresses';

@Entity({
  name: ADDRESS_TABLE_NAME,
})
export class Address {
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
}
