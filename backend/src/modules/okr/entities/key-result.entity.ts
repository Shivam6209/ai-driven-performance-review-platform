import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Objective } from './objective.entity';
import { OkrUpdate } from './okr-update.entity';

@Entity('key_results')
export class KeyResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  targetValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentValue!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  startValue!: number;

  @Column({
    type: 'enum',
    enum: ['number', 'percentage', 'currency', 'boolean'],
    default: 'number',
  })
  format!: string;

  @Column({ name: 'objective_id' })
  objectiveId!: string;

  @ManyToOne(() => Objective, (objective) => objective.keyResults)
  @JoinColumn({ name: 'objective_id' })
  objective!: Objective;

  @Column({ name: 'owner_id', nullable: true })
  ownerId?: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner?: Employee;

  @Column({
    type: 'enum',
    enum: ['not_started', 'in_progress', 'completed', 'at_risk'],
    default: 'not_started',
  })
  status!: string;

  @OneToMany(() => OkrUpdate, (update) => update.keyResult)
  updates!: OkrUpdate[];

  @Column({ name: 'due_date' })
  dueDate!: Date;

  @Column({ name: 'is_archived', default: false })
  isArchived!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 