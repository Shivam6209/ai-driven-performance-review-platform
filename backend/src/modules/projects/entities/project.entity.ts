import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Department } from '../../departments/entities/department.entity';

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status!: ProjectStatus;

  @Column({
    type: 'enum',
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM,
  })
  priority!: ProjectPriority;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'owner_id' })
  owner!: Employee;

  @Column({ name: 'owner_id' })
  ownerId!: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @Column({ name: 'department_id', nullable: true })
  departmentId?: string;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  @Column({ type: 'date', nullable: true })
  actual_end_date?: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress!: number;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 