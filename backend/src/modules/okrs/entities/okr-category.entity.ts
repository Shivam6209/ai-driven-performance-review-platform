import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { OKR } from './okr.entity';

@Entity('okr_categories')
export class OKRCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'color_code', default: '#007bff' })
  color_code!: string;

  @Column({ name: 'is_active', default: true })
  is_active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @OneToMany(() => OKR, (okr) => okr.category)
  okrs!: OKR[];
} 