import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  plate: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_expired: boolean;

  @Column({ name: 'expired_date', type: 'timestamptz', nullable: false })
  expired_date: Date;

  @Column({ type: 'text', nullable: false })
  password: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  @Column({ type: 'text', nullable: false })
  time_zone: string;

  @BeforeInsert()
  checkEmail() {
    this.plate = this.plate.trim();
  }
}
