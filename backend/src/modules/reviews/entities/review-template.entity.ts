import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Department } from '../../departments/entities/department.entity';
import { ReviewTemplateSection } from './review-template-section.entity';

@Entity('review_templates')
export class ReviewTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['self', 'manager', 'peer', '360', 'upward'],
    default: 'manager',
  })
  review_type!: string;

  @Column({ type: 'jsonb' })
  template_structure!: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  is_active!: boolean;

  @Column({ name: 'is_default', default: false })
  is_default!: boolean;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'created_by_id' })
  created_by!: Employee;

  @OneToMany(() => ReviewTemplateSection, (section) => section.template)
  sections!: ReviewTemplateSection[];

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
} 