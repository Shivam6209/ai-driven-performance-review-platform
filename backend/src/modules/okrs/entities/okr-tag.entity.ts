import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { OKR } from './okr.entity';

@Entity('okr_tags')
export class OkrTag {
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

  @Column({
    type: 'enum',
    enum: ['skill', 'project', 'department', 'priority', 'general'],
    default: 'general',
  })
  category!: string;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @ManyToMany(() => OKR, (okr) => okr.tags)
  okrs!: OKR[];
} 