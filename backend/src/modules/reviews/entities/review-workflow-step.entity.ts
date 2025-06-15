import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PerformanceReview } from './performance-review.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('review_workflow_steps')
export class ReviewWorkflowStep {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => PerformanceReview, (review) => review.workflow_steps)
  @JoinColumn({ name: 'review_id' })
  review!: PerformanceReview;

  @Column({ name: 'step_name' })
  step_name!: string;

  @Column({ name: 'step_order' })
  step_order!: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed', 'skipped'],
    default: 'pending',
  })
  status!: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assigned_to?: Employee;

  @Column({ name: 'due_date', nullable: true })
  due_date?: Date;

  @Column({ name: 'completed_at', nullable: true })
  completed_at?: Date;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'completed_by_id' })
  completed_by?: Employee;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
} 