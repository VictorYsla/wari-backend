import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  plate: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  expired: boolean;

  @Column({ name: 'expired_date', type: 'timestamptz', nullable: false })
  expired_date: Date | null;

  @Column({ name: 'clerk_id', nullable: false })
  clerk_id: string;

  @Column({ name: 'clerk_created_user_id', nullable: false })
  clerk_created_user_id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
