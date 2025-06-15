import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ReviewTemplate } from './review-template.entity';

@Entity('review_template_sections')
export class ReviewTemplateSection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ReviewTemplate, (template) => template.sections)
  @JoinColumn({ name: 'template_id' })
  template!: ReviewTemplate;

  @Column()
  section_name!: string;

  @Column({ type: 'text', nullable: true })
  section_description?: string;

  @Column({
    type: 'enum',
    enum: ['text', 'rating', 'goals', 'competencies'],
    default: 'text',
  })
  section_type!: string;

  @Column({ default: true })
  is_required!: boolean;

  @Column({ nullable: true })
  max_length?: number;

  @Column({ default: 5 })
  rating_scale!: number;

  @Column({ default: 0 })
  display_order!: number;

  @Column({ default: false })
  ai_generation_enabled!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
} 