import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('webhook_endpoints')
export class WebhookEndpoint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  url!: string;

  @Column({ type: 'enum', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], default: 'POST' })
  method!: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  @Column({ type: 'jsonb', nullable: true })
  headers?: Record<string, string>;

  @Column({ type: 'simple-array' })
  events!: string[]; // e.g., ['review.created', 'feedback.submitted']

  @Column({ name: 'is_active', default: true })
  is_active!: boolean;

  @Column({ nullable: true })
  secret?: string; // For webhook signature verification

  @Column({ name: 'max_retries', default: 3 })
  max_retries!: number;

  @Column({ name: 'timeout_seconds', default: 30 })
  timeout_seconds!: number;

  @Column({ name: 'last_triggered_at', nullable: true })
  last_triggered_at?: Date;

  @Column({ name: 'success_count', default: 0 })
  success_count!: number;

  @Column({ name: 'failure_count', default: 0 })
  failure_count!: number;

  @Column({ name: 'created_by' })
  created_by!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
} 