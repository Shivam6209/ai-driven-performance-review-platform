import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { IntegrationLog } from './integration-log.entity';

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ['hr_system', 'sso', 'calendar', 'notification', 'webhook'] })
  type!: 'hr_system' | 'sso' | 'calendar' | 'notification' | 'webhook';

  @Column()
  provider!: string; // e.g., 'workday', 'okta', 'google_calendar', 'slack'

  @Column({ type: 'jsonb' })
  configuration!: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  credentials?: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  is_active!: boolean;

  @Column({ name: 'is_test_mode', default: false })
  is_test_mode!: boolean;

  @Column({ name: 'last_sync_at', nullable: true })
  last_sync_at?: Date;

  @Column({ name: 'next_sync_at', nullable: true })
  next_sync_at?: Date;

  @Column({ name: 'health_status', type: 'enum', enum: ['healthy', 'warning', 'error', 'disabled'], default: 'healthy' })
  health_status!: 'healthy' | 'warning' | 'error' | 'disabled';

  @Column({ name: 'health_message', nullable: true })
  health_message?: string;

  @Column({ name: 'created_by' })
  created_by!: string;

  @OneToMany(() => IntegrationLog, (log) => log.integration)
  logs!: IntegrationLog[];

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
} 