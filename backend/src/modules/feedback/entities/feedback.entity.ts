import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { FeedbackTag } from './feedback-tag.entity';
import { FeedbackResponse } from './feedback-response.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'enum',
    enum: ['public', 'private', 'manager_only', 'hr_only'],
    default: 'private',
  })
  visibility!: string;

  @Column({ name: 'given_by_id' })
  givenById!: string;

  @ManyToOne(() => Employee, (employee) => employee.given_feedback)
  @JoinColumn({ name: 'given_by_id' })
  givenBy!: Employee;

  @Column({ name: 'receiver_id' })
  receiverId!: string;

  @ManyToOne(() => Employee, (employee) => employee.received_feedback)
  @JoinColumn({ name: 'receiver_id' })
  receiver!: Employee;

  @Column({ name: 'is_read', default: false })
  isRead!: boolean;

  @Column({ name: 'is_acknowledged', default: false })
  isAcknowledged!: boolean;

  @Column({ name: 'context_type', nullable: true })
  contextType?: string;

  @Column({ name: 'context_id', nullable: true })
  contextId?: string;

  @ManyToMany(() => FeedbackTag, (tag) => tag.feedback)
  @JoinTable({
    name: 'feedback_tags_mapping',
    joinColumn: { name: 'feedback_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: FeedbackTag[];

  @OneToMany(() => FeedbackResponse, (response) => response.feedback)
  responses!: FeedbackResponse[];

  @OneToMany(() => Feedback, (feedback) => feedback.parentFeedback)
  replies!: Feedback[];

  @ManyToOne(() => Feedback, (feedback) => feedback.replies, { nullable: true })
  @JoinColumn({ name: 'parent_feedback_id' })
  parentFeedback?: Feedback;

  @Column({ name: 'parent_feedback_id', nullable: true })
  parentFeedbackId?: string;

  // AI Analysis fields
  @Column({ type: 'enum', enum: ['positive', 'neutral', 'negative'], nullable: true })
  tone?: string;

  @Column({ name: 'quality_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  qualityScore?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 