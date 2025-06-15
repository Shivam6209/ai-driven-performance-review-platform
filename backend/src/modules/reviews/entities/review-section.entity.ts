import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PerformanceReview } from './performance-review.entity';

@Entity('review_sections')
export class ReviewSection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => PerformanceReview, (review) => review.sections)
  @JoinColumn({ name: 'review_id' })
  review!: PerformanceReview;

  @Column({ name: 'review_id' })
  reviewId!: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating?: number;

  @Column({ type: 'text', nullable: true })
  comments?: string;

  @Column({ name: 'section_order', default: 0 })
  section_order!: number;

  @Column({ name: 'is_required', default: true })
  is_required!: boolean;

  @Column({ name: 'max_rating', default: 5 })
  max_rating!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
} 