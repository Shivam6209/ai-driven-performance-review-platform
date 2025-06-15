import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('role_assignments')
export class RoleAssignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'role_id' })
  role_id!: string;

  @ManyToOne(() => Role, (role) => role.assignments)
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({ name: 'employee_id' })
  employee_id!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ name: 'assigned_by_id' })
  assigned_by_id!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'assigned_by_id' })
  assigned_by!: Employee;

  @Column({ name: 'assigned_at' })
  assigned_at!: Date;

  @Column({ name: 'expires_at', nullable: true })
  expires_at?: Date;

  @Column({ name: 'is_active', default: true })
  is_active!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  scope?: Record<string, any>;

  @Column({ name: 'context_type', nullable: true })
  context_type?: string;

  @Column({ name: 'context_id', nullable: true })
  context_id?: string;

  @Column({ name: 'granted_by' })
  granted_by!: string;

  @Column({ name: 'valid_from' })
  valid_from!: Date;

  @Column({ name: 'valid_until', nullable: true })
  valid_until?: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
} 