import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Integration } from './integration.entity';

@Entity('integration_logs')
export class IntegrationLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'integration_id' })
  integration_id!: string;

  @Column()
  operation!: string; // e.g., 'sync', 'webhook', 'auth', 'test'

  @Column({ type: 'enum', enum: ['success', 'warning', 'error'] })
  status!: 'success' | 'warning' | 'error';

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'request_data', type: 'jsonb', nullable: true })
  request_data?: Record<string, any>;

  @Column({ name: 'response_data', type: 'jsonb', nullable: true })
  response_data?: Record<string, any>;

  @Column({ name: 'error_details', type: 'jsonb', nullable: true })
  error_details?: Record<string, any>;

  @Column({ name: 'duration_ms', default: 0 })
  duration_ms!: number;

  @Column({ name: 'external_id', nullable: true })
  external_id?: string; // ID from external system

  @ManyToOne(() => Integration, (integration) => integration.logs)
  @JoinColumn({ name: 'integration_id' })
  integration!: Integration;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
} 