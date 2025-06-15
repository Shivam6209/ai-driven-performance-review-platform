import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Feedback } from './feedback.entity';

@Entity('feedback_tags')
export class FeedbackTag {
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
    enum: ['skill', 'behavior', 'project', 'goal', 'general'],
    default: 'general',
  })
  category!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @ManyToMany(() => Feedback, (feedback) => feedback.tags)
  feedback!: Feedback[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 