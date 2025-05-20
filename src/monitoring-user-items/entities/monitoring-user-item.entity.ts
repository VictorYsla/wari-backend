import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('monitoring_user_items')
export class MonitoringUserItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  plate: string;

  @Column({ type: 'text' })
  user_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
