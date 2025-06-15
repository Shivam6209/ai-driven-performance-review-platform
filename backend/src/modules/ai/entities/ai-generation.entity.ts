import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('ai_generations')
export class AiGeneration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @Column({ name: 'generation_type' })
  generationType!: string; // 'review', 'feedback', 'okr', etc.

  @Column({ type: 'text' })
  prompt!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'jsonb', nullable: true })
  sources?: any;

  @Column({ type: 'float', default: 0 })
  confidence!: number;

  @Column({ name: 'is_edited', default: false })
  isEdited!: boolean;

  @Column({ name: 'edited_content', type: 'text', nullable: true })
  editedContent?: string;

  @Column({ name: 'model_version' })
  modelVersion!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 