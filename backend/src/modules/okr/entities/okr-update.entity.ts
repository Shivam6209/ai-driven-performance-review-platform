import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { KeyResult } from './key-result.entity';

@Entity('okr_updates')
export class OkrUpdate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  previousValue!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  newValue!: number;

  @Column({ name: 'key_result_id' })
  keyResultId!: string;

  @ManyToOne(() => KeyResult, (keyResult) => keyResult.updates)
  @JoinColumn({ name: 'key_result_id' })
  keyResult!: KeyResult;

  @Column({ name: 'updated_by_id' })
  updatedById!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy!: Employee;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
} 