import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { OKRLevel } from '../enums/okr-level.enum';
import { OKRCategory } from '../enums/okr-category.enum';
import { OKRStatus } from '../enums/okr-status.enum';
import { OKRPriority } from '../enums/okr-priority.enum';
import { OKRUpdate } from './okr-update.entity';
import { OkrTag } from './okr-tag.entity';

@Entity('okrs')
export class OKR {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'employee_id' })
  employee_id!: string;

  @ManyToOne(() => Employee, (employee) => employee.okrs)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => OKR, (okr) => okr.child_okrs, { nullable: true })
  @JoinColumn({ name: 'parent_okr_id' })
  parent_okr?: OKR;

  @OneToMany(() => OKR, (okr) => okr.parent_okr)
  child_okrs!: OKR[];

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: OKRLevel,
    default: OKRLevel.INDIVIDUAL,
  })
  level!: OKRLevel;

  @Column({
    type: 'enum',
    enum: OKRCategory,
    default: OKRCategory.GENERAL,
  })
  category!: OKRCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  target_value!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  current_value!: number;

  @Column()
  unit_of_measure!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  weight!: number;

  @Column({
    type: 'enum',
    enum: OKRPriority,
    default: OKRPriority.MEDIUM,
  })
  priority!: OKRPriority;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  due_date!: Date;

  @Column({
    type: 'enum',
    enum: OKRStatus,
    default: OKRStatus.NOT_STARTED,
  })
  status!: OKRStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress!: number;

  @Column({ name: 'approved_by_id', nullable: true })
  approved_by_id?: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approved_by_id' })
  approved_by?: Employee;

  @Column({ name: 'approved_at', nullable: true })
  approved_at?: Date;

  @OneToMany(() => OKRUpdate, (update) => update.okr)
  updates!: OKRUpdate[];

  @ManyToMany(() => OkrTag, (tag) => tag.okrs)
  @JoinTable({
    name: 'okr_tag_assignments',
    joinColumn: { name: 'okr_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: OkrTag[];

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}