import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { OKR } from './okr.entity';

@Entity('okr_updates')
export class OKRUpdate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'okr_id' })
  okr_id!: string;

  @ManyToOne(() => OKR, (okr) => okr.updates)
  @JoinColumn({ name: 'okr_id' })
  okr!: OKR;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'updated_by_id' })
  updated_by!: Employee;

  @Column({ type: 'text' })
  update_text!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  previous_value!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  new_value!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  completion_percentage!: number;

  @Column({ nullable: true })
  status_change?: string;

  @Column({ type: 'text', nullable: true })
  blockers?: string;

  @Column({ type: 'text', nullable: true })
  next_steps?: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
} 