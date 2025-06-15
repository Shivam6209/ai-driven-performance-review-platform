import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Project } from './project.entity';

export enum ProjectRole {
  OWNER = 'owner',
  LEAD = 'lead',
  MEMBER = 'member',
  CONTRIBUTOR = 'contributor',
  OBSERVER = 'observer',
}

@Entity('project_members')
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @Column({ name: 'project_id' })
  projectId!: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @Column({ name: 'employee_id' })
  employeeId!: string;

  @Column({
    type: 'enum',
    enum: ProjectRole,
    default: ProjectRole.MEMBER,
  })
  role!: ProjectRole;

  @Column({ type: 'date' })
  joined_date!: Date;

  @Column({ type: 'date', nullable: true })
  left_date?: Date;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
} 