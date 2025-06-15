import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { ReviewCycle } from './review-cycle.entity';
import { ReviewSection } from './review-section.entity';
import { ReviewWorkflowStep } from './review-workflow-step.entity';

@Entity('performance_reviews')
export class PerformanceReview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id' })
  employee_id!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer!: Employee;

  @ManyToOne(() => ReviewCycle, (cycle) => cycle.reviews)
  @JoinColumn({ name: 'review_cycle_id' })
  review_cycle!: ReviewCycle;

  @Column({
    type: 'enum',
    enum: ['self', 'manager', 'peer', '360', 'upward'],
    default: 'manager',
  })
  review_type!: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'in_progress', 'submitted', 'approved', 'rejected'],
    default: 'draft',
  })
  status!: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  overall_rating?: number;

  @Column({ name: 'submitted_at', nullable: true })
  submitted_at?: Date;

  @Column({ name: 'approved_at', nullable: true })
  approved_at?: Date;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approved_by_id' })
  approved_by?: Employee;

  @Column({ name: 'due_date' })
  due_date!: Date;

  @OneToMany(() => ReviewSection, (section) => section.review)
  sections!: ReviewSection[];

  @OneToMany(() => ReviewWorkflowStep, (step) => step.review)
  workflow_steps!: ReviewWorkflowStep[];

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
} 