import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('departments')
@Unique(['name', 'organizationId'])
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'parent_department_id', nullable: true })
  parentDepartmentId?: string;

  @ManyToOne(() => Department, (department) => department.childDepartments, { nullable: true })
  @JoinColumn({ name: 'parent_department_id' })
  parentDepartment?: Department;

  @OneToMany(() => Department, (department) => department.parentDepartment)
  childDepartments!: Department[];

  @Column({ name: 'head_id', nullable: true })
  headId?: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'head_id' })
  head?: Employee;

  @OneToMany(() => Employee, (employee) => employee.department)
  employees!: Employee[];

  // Organization relationship
  @Column({ name: 'organization_id', nullable: true })
  organizationId?: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 