import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Objective } from './objective.entity';

@Entity('okr_categories')
export class OkrCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: '#007bff' })
  color!: string;

  @Column({ nullable: true })
  icon?: string;

  @OneToMany(() => Objective, (objective) => objective.category)
  objectives!: Objective[];

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 