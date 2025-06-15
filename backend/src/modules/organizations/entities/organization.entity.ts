import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  domain!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => User, (user) => user.organization)
  users!: User[];

  @OneToMany(() => Employee, (employee) => employee.organization)
  employees!: Employee[];
} 