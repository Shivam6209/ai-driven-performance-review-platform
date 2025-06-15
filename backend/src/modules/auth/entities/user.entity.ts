import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';
import { Employee } from '../../employees/entities/employee.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role!: UserRole;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ nullable: true })
  passwordResetToken?: string;

  @Column({ nullable: true })
  passwordResetExpires?: Date;

  @Column({ nullable: true })
  lastLogin?: Date;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Organization relationship
  @Column({ name: 'organization_id', nullable: true })
  organizationId?: string;

  @ManyToOne(() => Organization, (organization) => organization.users, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  // One-to-One relationship with Employee
  @OneToOne(() => Employee, (employee) => employee.user, { nullable: true })
  @JoinColumn({ name: 'employee_id' })
  employee?: Employee;

  @Column({ name: 'employee_id', nullable: true })
  employeeId?: string;
} 