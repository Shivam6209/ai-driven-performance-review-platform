import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('user_permissions')
@Index(['employee_id', 'resource', 'action'], { unique: true })
export class UserPermission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id' })
  employee_id!: string;

  @Column({ length: 100 })
  resource!: string;

  @Column({ length: 100 })
  action!: string;

  @Column({ default: true })
  granted!: boolean;

  @Column({ name: 'granted_by', nullable: true })
  granted_by?: string;

  @Column({ name: 'context_type', nullable: true })
  context_type?: string;

  @Column({ name: 'context_id', nullable: true })
  context_id?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'granted_by' })
  granter?: Employee;
} 