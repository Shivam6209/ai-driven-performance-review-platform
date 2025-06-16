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

  @Column({ name: 'reviewer_id', nullable: true })
  reviewer_id?: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer?: Employee;

  @Column({ name: 'review_cycle_id' })
  review_cycle_id!: string;

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
    enum: ['draft', 'in_progress', 'submitted', 'approved', 'rejected', 'ai_generated'],
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

  // AI-specific fields
  @Column({ name: 'is_ai_generated', default: false })
  is_ai_generated!: boolean;

  @Column({ name: 'ai_confidence_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  ai_confidence_score?: number;

  @Column({ name: 'ai_generated_at', nullable: true })
  ai_generated_at?: Date;

  @Column({ name: 'ai_sources', type: 'jsonb', nullable: true })
  ai_sources?: {
    okrs: string[];
    feedback: string[];
    projects: string[];
    goals: string[];
  };

  @Column({ name: 'human_edited', default: false })
  human_edited!: boolean;

  @Column({ name: 'human_edited_at', nullable: true })
  human_edited_at?: Date;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'human_edited_by_id' })
  human_edited_by?: Employee;

  // Review content fields
  @Column({ type: 'text', nullable: true })
  strengths?: string;

  @Column({ type: 'text', nullable: true })
  areas_for_improvement?: string;

  @Column({ type: 'text', nullable: true })
  achievements?: string;

  @Column({ type: 'text', nullable: true })
  goals_for_next_period?: string;

  @Column({ type: 'text', nullable: true })
  manager_comments?: string;

  @Column({ type: 'text', nullable: true })
  employee_comments?: string;

  @Column({ type: 'text', nullable: true })
  development_plan?: string;

  // Organization relationship
  @Column({ name: 'organization_id', nullable: true })
  organizationId?: string;

  @OneToMany(() => ReviewSection, (section) => section.review)
  sections!: ReviewSection[];

  @OneToMany(() => ReviewWorkflowStep, (step) => step.review)
  workflow_steps!: ReviewWorkflowStep[];

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
} 