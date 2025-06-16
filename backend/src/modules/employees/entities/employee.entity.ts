import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from '../../departments/entities/department.entity';
import { OKR } from '../../okrs/entities/okr.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { PerformanceReview } from '../../reviews/entities/performance-review.entity';
import { User } from '../../auth/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_code', unique: true })
  employeeCode!: string;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'display_name', nullable: true })
  displayName?: string;

  @Column({ name: 'job_title', nullable: true })
  jobTitle?: string;

  @Column({ name: 'role' })
  role!: 'admin' | 'hr' | 'manager' | 'employee';

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'profile_image_url', nullable: true })
  profileImageUrl?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'hire_date', nullable: true })
  hireDate?: Date;

  @Column({ name: 'employment_status', default: 'active' })
  employmentStatus!: 'active' | 'inactive' | 'terminated';

  @Column({ name: 'timezone', nullable: true })
  timezone?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Organization relationship
  @Column({ name: 'organization_id', nullable: true })
  organizationId?: string;

  @ManyToOne(() => Organization, (organization) => organization.employees, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  // Relationship back to User (authentication)
  @OneToOne(() => User, (user) => user.employee, { nullable: true })
  user?: User;

  // Department relationship
  @Column({ name: 'department_id', nullable: true })
  departmentId?: string;

  @ManyToOne(() => Department, (department) => department.employees, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  // HR Departments relationship (many-to-many for HR personnel)
  @ManyToMany(() => Department, (department) => department.hrPersonnel)
  hrDepartments!: Department[];

  // Manager relationship (self-referencing)
  @Column({ name: 'manager_id', nullable: true })
  managerId?: string;

  @ManyToOne(() => Employee, (employee) => employee.directReports, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager?: Employee;

  @OneToMany(() => Employee, (employee) => employee.manager)
  directReports!: Employee[];

  // Virtual property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Performance management relationships
  @OneToMany(() => OKR, (okr) => okr.employee)
  okrs!: OKR[];

  @OneToMany(() => Feedback, (feedback) => feedback.givenBy)
  given_feedback!: Feedback[];

  @OneToMany(() => Feedback, (feedback) => feedback.receiver)
  received_feedback!: Feedback[];

  @OneToMany(() => PerformanceReview, (review) => review.employee)
  reviews!: PerformanceReview[];

  @OneToMany(() => PerformanceReview, (review) => review.reviewer)
  reviews_given!: PerformanceReview[];
} 