import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('data_retention_policies')
export class DataRetentionPolicy {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'resource_type' })
  resource_type!: string;

  @Column({ name: 'retention_period_days' })
  retention_period_days!: number;

  @Column({ name: 'is_enabled', default: true })
  is_enabled!: boolean;

  @Column({ name: 'conditions', type: 'jsonb', nullable: true })
  conditions?: Record<string, any>;

  @Column({ name: 'archive_strategy', type: 'enum', enum: ['delete', 'anonymize', 'archive'], default: 'delete' })
  archive_strategy!: 'delete' | 'anonymize' | 'archive';

  @Column({ name: 'archive_config', type: 'jsonb', nullable: true })
  archive_config?: Record<string, any>;

  @Column({ name: 'last_execution_date', nullable: true })
  last_execution_date?: Date;

  @Column({ name: 'created_by' })
  created_by!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
} 