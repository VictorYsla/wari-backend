import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('monitoring_items')
export class MonitoringItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  imei: string;

  @Column({ type: 'text' })
  tripId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
