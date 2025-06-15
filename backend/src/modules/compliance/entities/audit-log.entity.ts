import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index(['event_type', 'resource_type', 'created_at'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Event information
  @Column({ name: 'event_type' })
  event_type!: string;

  @Column({ name: 'resource_type' })
  resource_type!: string;

  @Column({ name: 'resource_id' })
  resource_id!: string;

  @Column({ name: 'before_state', type: 'jsonb', nullable: true })
  before_state?: Record<string, any>;

  @Column({ name: 'after_state', type: 'jsonb', nullable: true })
  after_state?: Record<string, any>;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Actor information
  @Column({ name: 'actor_id' })
  actor_id!: string;

  @Column({ name: 'actor_type' })
  actor_type!: string;

  @Column({ name: 'actor_ip', nullable: true })
  actor_ip?: string;

  @Column({ name: 'status', default: 'success' })
  status!: string;

  @Column({ name: 'status_message', nullable: true })
  status_message?: string;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
} 