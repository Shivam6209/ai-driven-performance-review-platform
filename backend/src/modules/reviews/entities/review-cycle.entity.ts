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
import { Department } from '../../departments/entities/department.entity';
import { PerformanceReview } from './performance-review.entity';

@Entity('review_cycles')
export class ReviewCycle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['quarterly', 'semi_annual', 'annual', 'custom'],
    default: 'quarterly',
  })
  cycle_type!: string;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  @Column({ type: 'date' })
  submission_deadline!: Date;

  @Column({ type: 'date' })
  approval_deadline!: Date;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @Column({
    type: 'enum',
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning',
  })
  status!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'created_by_id' })
  created_by!: Employee;

  @OneToMany(() => PerformanceReview, (review) => review.review_cycle)
  reviews!: PerformanceReview[];

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
} 