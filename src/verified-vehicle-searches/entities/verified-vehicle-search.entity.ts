import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('verified_vehicle_searches')
export class VerifiedVehicleSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  plate: string;

  @Column({ nullable: true })
  imei: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  user_id: string;

  @Column({ name: 'was_verified', type: 'boolean', default: false })
  was_verified: boolean;

  @Column({ name: 'is_user_expired', type: 'boolean', default: false })
  is_user_expired: boolean;

  @CreateDateColumn({ name: 'searched_at', type: 'timestamptz' })
  searched_at: Date;
}
