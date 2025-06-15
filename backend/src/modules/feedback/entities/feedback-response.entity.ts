import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { Feedback } from './feedback.entity';

@Entity('feedback_responses')
export class FeedbackResponse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'feedback_id' })
  feedbackId!: string;

  @ManyToOne(() => Feedback, (feedback) => feedback.responses)
  @JoinColumn({ name: 'feedback_id' })
  feedback!: Feedback;

  @Column({ name: 'responder_id' })
  responderId!: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'responder_id' })
  responder!: Employee;

  @Column({ name: 'is_read', default: false })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
} 