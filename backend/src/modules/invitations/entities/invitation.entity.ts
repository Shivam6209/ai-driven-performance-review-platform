import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../auth/entities/user.entity';
import { UserRole } from '../../auth/enums/user-role.enum';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
}

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  email!: string;

  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ name: 'job_title', nullable: true })
  jobTitle?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: true,
  })
  role?: UserRole;

  @Column('simple-array', { name: 'permissions', nullable: true })
  permissions?: string[];

  @Column({ name: 'temp_password', nullable: true })
  tempPassword?: string;

  @Column()
  token!: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status!: InvitationStatus;

  @Column({ name: 'expires_at' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @Column({ name: 'organization_id' })
  organizationId!: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @Column({ name: 'invited_by' })
  invitedBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'invited_by' })
  inviter!: User;
} 