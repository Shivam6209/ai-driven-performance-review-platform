import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { FeedbackTag } from './entities/feedback-tag.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackAnalyticsDto } from './dto/feedback-analytics.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(FeedbackTag)
    private tagRepository: Repository<FeedbackTag>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto, giverId: string) {
    // Verify that receiver exists
    const receiver = await this.employeeRepository.findOne({ 
      where: { id: createFeedbackDto.receiver_id } 
    });
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    // Create feedback entity
    const feedback = this.feedbackRepository.create({
      ...createFeedbackDto,
      givenBy: { id: giverId },
      receiver: { id: createFeedbackDto.receiver_id },
    });

    // Handle tags if provided
    if (createFeedbackDto.tag_ids && createFeedbackDto.tag_ids.length > 0) {
      const tags = await this.tagRepository.findByIds(createFeedbackDto.tag_ids);
      feedback.tags = tags;
    }

    return this.feedbackRepository.save(feedback);
  }

  async findAll(type?: string, visibility?: string) {
    const query: any = {};
    
    if (type) {
      query.feedback_type = type;
    }
    
    if (visibility) {
      query.visibility = visibility;
    }
    
    return this.feedbackRepository.find({
      where: query,
      relations: ['givenBy', 'receiver', 'tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findReceived(employeeId: string, read?: boolean) {
    const query: any = {
      receiver: { id: employeeId },
      parent_feedback: null, // Only get top-level feedback, not replies
    };
    
    if (read !== undefined) {
      query.read_at = read ? 'NOT NULL' : null;
    }
    
    return this.feedbackRepository.find({
      where: query,
      relations: ['giver', 'tags', 'replies'],
      order: { createdAt: 'DESC' },
    });
  }

  async findGiven(employeeId: string) {
    return this.feedbackRepository.find({
      where: {
        givenBy: { id: employeeId },
      },
      relations: ['receiver', 'tags'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['giver', 'receiver', 'tags', 'parent_feedback', 'replies'],
    });
    
    if (!feedback) {
      throw new NotFoundException(`Feedback #${id} not found`);
    }
    
    return feedback;
  }

  async update(id: string, updateFeedbackDto: UpdateFeedbackDto) {
    const feedback = await this.findOne(id);
    
    // Update basic properties
    Object.assign(feedback, updateFeedbackDto);
    
    // Handle tags if provided
    if (updateFeedbackDto.tag_ids) {
      const tags = await this.tagRepository.findByIds(updateFeedbackDto.tag_ids);
      feedback.tags = tags;
    }
    
    return this.feedbackRepository.save(feedback);
  }

  async remove(id: string, userId: string) {
    const feedback = await this.findOne(id);
    
    // Only allow deletion by the feedback giver
    if (feedback.givenBy.id !== userId) {
      throw new ForbiddenException('You can only delete feedback you have given');
    }
    
    return this.feedbackRepository.remove(feedback);
  }

  async markRead(id: string, userId: string) {
    const feedback = await this.findOne(id);
    
    // Only the receiver can mark feedback as read
    if (feedback.receiver.id !== userId) {
      throw new ForbiddenException('You can only mark feedback addressed to you as read');
    }
    
    feedback.isRead = true;
    return this.feedbackRepository.save(feedback);
  }

  async acknowledge(id: string, userId: string) {
    const feedback = await this.findOne(id);
    
    // Only the receiver can acknowledge feedback
    if (feedback.receiver.id !== userId) {
      throw new ForbiddenException('You can only acknowledge feedback addressed to you');
    }
    
    feedback.isAcknowledged = true;
    return this.feedbackRepository.save(feedback);
  }

  async getThread(id: string) {
    // Find the root feedback (if this is a reply)
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['parentFeedback'],
    });
    
    if (!feedback) {
      throw new NotFoundException(`Feedback #${id} not found`);
    }
    
    // If this is a reply, get the root feedback
    const rootId = feedback.parentFeedback ? feedback.parentFeedback.id : id;
    
    // Get the root feedback with all replies
    const thread = await this.feedbackRepository.findOne({
      where: { id: rootId },
      relations: [
        'givenBy', 
        'receiver', 
        'tags', 
        'replies', 
        'replies.givenBy', 
        'replies.receiver',
        'replies.tags'
      ],
    });
    
    if (!thread) {
      throw new NotFoundException(`Thread #${rootId} not found`);
    }
    
    return thread;
  }

  async reply(parentId: string, createFeedbackDto: CreateFeedbackDto, giverId: string) {
    // Verify parent feedback exists
    await this.findOne(parentId);
    
    // Create reply
    const reply = this.feedbackRepository.create({
      ...createFeedbackDto,
      givenBy: { id: giverId },
      receiver: { id: createFeedbackDto.receiver_id },
      parentFeedback: { id: parentId },
    });
    
    // Handle tags if provided
    if (createFeedbackDto.tag_ids && createFeedbackDto.tag_ids.length > 0) {
      const tags = await this.tagRepository.findByIds(createFeedbackDto.tag_ids);
      reply.tags = tags;
    }
    
    return this.feedbackRepository.save(reply);
  }

  async getAnalytics(analyticsDto: FeedbackAnalyticsDto, _userId: string) {
    const { start_date, end_date, type, team_id, department_id } = analyticsDto;
    
    // Set default date range if not provided
    const startDate = start_date ? new Date(start_date) : new Date(new Date().setMonth(new Date().getMonth() - 3));
    const endDate = end_date ? new Date(end_date) : new Date();
    
    // Base query for date range
    const baseQuery: any = {
      createdAt: Between(startDate, endDate),
    };
    
    // Add team/department filter if provided
    if (team_id || department_id) {
      if (team_id) {
        baseQuery.receiver = { team: { id: team_id } };
      } else if (department_id) {
        baseQuery.receiver = { department: { id: department_id } };
      }
    }
    
    // Get all feedback within parameters
    const allFeedback = await this.feedbackRepository.find({
      where: baseQuery,
      relations: ['givenBy', 'receiver', 'tags'],
    });
    
    // Process based on analytics type
    switch (type) {
      case 'frequency':
        return this.calculateFrequencyDistribution(allFeedback);
      
      case 'quality':
        return this.calculateQualityDistribution(allFeedback);
      
      case 'sentiment':
        return this.calculateSentimentTrends(allFeedback);
      
      case 'response_time':
        return this.calculateResponseTime(allFeedback);
      
      case 'action_completion':
        return this.calculateActionCompletion(allFeedback);
      
      default:
        // Return all analytics
        return {
          frequency: this.calculateFrequencyDistribution(allFeedback),
          quality: this.calculateQualityDistribution(allFeedback),
          sentiment: this.calculateSentimentTrends(allFeedback),
          response_time: this.calculateResponseTime(allFeedback),
          action_completion: this.calculateActionCompletion(allFeedback),
          total_count: allFeedback.length,
          date_range: { start_date: startDate, end_date: endDate },
        };
    }
  }

  private calculateFrequencyDistribution(feedback: Feedback[]): any {
    const frequencyMap: Record<string, number> = {};
    
    feedback.forEach(item => {
      const date = new Date(item.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      frequencyMap[key] = (frequencyMap[key] || 0) + 1;
    });
    
    return frequencyMap;
  }

  private calculateQualityDistribution(feedback: Feedback[]): any {
    const scoredFeedback = feedback.filter(item => item.qualityScore !== null);
    
    if (scoredFeedback.length === 0) {
      return { averageScore: 0, distribution: {}, sampleSize: 0 };
    }
    
    const totalScore = scoredFeedback.reduce((sum, item) => sum + Number(item.qualityScore), 0);
    const averageScore = totalScore / scoredFeedback.length;
    
    const distribution = {
      excellent: scoredFeedback.filter(item => Number(item.qualityScore) > 0.8).length,
      good: scoredFeedback.filter(item => Number(item.qualityScore) > 0.6 && Number(item.qualityScore) <= 0.8).length,
      average: scoredFeedback.filter(item => Number(item.qualityScore) > 0.4 && Number(item.qualityScore) <= 0.6).length,
      poor: scoredFeedback.filter(item => Number(item.qualityScore) > 0.2 && Number(item.qualityScore) <= 0.4).length,
      very_poor: scoredFeedback.filter(item => Number(item.qualityScore) <= 0.2).length,
    };
    
    return {
      averageScore,
      distribution,
      sampleSize: scoredFeedback.length,
    };
  }

  private calculateSentimentTrends(feedback: Feedback[]): any {
    // Use tone instead of sentiment score for now
    const toneDistribution: Record<string, number> = {};
    
    feedback.forEach(item => {
      const tone = item.tone || 'neutral';
      toneDistribution[tone] = (toneDistribution[tone] || 0) + 1;
    });
    
    // Calculate trend over time by tone
    const sortedFeedback = feedback.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const trends = sortedFeedback.map(item => ({
      date: item.createdAt,
      tone: item.tone,
    }));
    
    return {
      toneDistribution,
      trends,
      sampleSize: feedback.length,
    };
  }

  private calculateResponseTime(feedback: Feedback[]): any {
    // Filter feedback that has replies
    const feedbackWithReplies = feedback.filter(
      item => item.parentFeedback === null && item.replies && item.replies.length > 0
    );

    const responseTimes: number[] = [];

    feedbackWithReplies.forEach(item => {
      if (item.replies && item.replies.length > 0) {
        const originalDate = new Date(item.createdAt).getTime();
        const firstReplyDate = new Date(item.replies[0].createdAt).getTime();
        const responseTimeHours = (firstReplyDate - originalDate) / (1000 * 60 * 60);
        responseTimes.push(responseTimeHours);
      }
    });

    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

    return {
      averageResponseTimeHours: averageResponseTime || 0,
      under_1_hour: responseTimes.filter(time => time <= 1).length,
      under_24_hours: responseTimes.filter(time => time > 1 && time <= 24).length,
      under_48_hours: responseTimes.filter(time => time > 24 && time <= 48).length,
      under_week: responseTimes.filter(time => time > 48 && time <= 168).length,
      over_week: responseTimes.filter(time => time > 168).length,
    };
  }

  private calculateActionCompletion(feedback: Feedback[]): any {
    // Calculate action completion based on acknowledgment
    const acknowledgedFeedback = feedback.filter(item => item.isAcknowledged === true);
    const totalFeedback = feedback.length;
    const completionRate = totalFeedback > 0 ? (acknowledgedFeedback.length / totalFeedback) * 100 : 0;

    return {
      totalFeedback,
      acknowledgedFeedback: acknowledgedFeedback.length,
      completionRate: Math.round(completionRate),
    };
  }
} 