import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Department } from '../../departments/entities/department.entity';
import { KeyResult } from './key-result.entity';
import { OkrCategory } from './okr-category.entity';

@Entity('objectives')
export class Objective {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress!: number;

  @Column({ name: 'start_date' })
  startDate!: Date;

  @Column({ name: 'end_date' })
  endDate!: Date;

  @Column({
    type: 'enum',
    enum: ['company', 'department', 'team', 'individual'],
    default: 'individual',
  })
  level!: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId?: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner?: Employee;

  @Column({ name: 'department_id', nullable: true })
  departmentId?: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @Column({ name: 'parent_objective_id', nullable: true })
  parentObjectiveId?: string;

  @ManyToOne(() => Objective, (objective) => objective.childObjectives, { nullable: true })
  @JoinColumn({ name: 'parent_objective_id' })
  parentObjective?: Objective;

  @OneToMany(() => Objective, (objective) => objective.parentObjective)
  childObjectives!: Objective[];

  @OneToMany(() => KeyResult, (keyResult) => keyResult.objective)
  keyResults!: KeyResult[];

  @Column({ name: 'category_id', nullable: true })
  categoryId?: string;

  @ManyToOne(() => OkrCategory, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: OkrCategory;

  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft',
  })
  status!: string;

  @Column({ name: 'is_archived', default: false })
  isArchived!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 