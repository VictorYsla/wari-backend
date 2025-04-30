import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'is_completed', default: false })
  is_completed: boolean;

  @Column({ name: 'is_canceled_by_passenger', default: false })
  is_canceled_by_passenger: boolean;

  @Column({ nullable: true })
  destination: string;

  @Column()
  imei: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
