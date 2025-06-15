import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedbackAnalyticsDto } from './dto/feedback-analytics.dto';

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let service: FeedbackService;

  const mockFeedbackService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findReceived: jest.fn(),
    findGiven: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    markRead: jest.fn(),
    acknowledge: jest.fn(),
    getThread: jest.fn(),
    reply: jest.fn(),
    getAnalytics: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'user-123',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FeedbackController>(FeedbackController);
    service = module.get<FeedbackService>(FeedbackService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create feedback', async () => {
      const createFeedbackDto: CreateFeedbackDto = {
        content: 'Great job on the project!',
        receiver_id: 'user-456',
        feedback_type: 'appreciation',
        visibility: 'public',
      };

      const expectedResult = {
        id: 'feedback-123',
        ...createFeedbackDto,
        giver: { id: mockRequest.user.id },
        receiver: { id: createFeedbackDto.receiver_id },
        created_at: new Date(),
      };

      mockFeedbackService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createFeedbackDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createFeedbackDto, mockRequest.user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all feedback', async () => {
      const expectedResult = [
        { id: 'feedback-1', content: 'Feedback 1' },
        { id: 'feedback-2', content: 'Feedback 2' },
      ];

      mockFeedbackService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll('appreciation', 'public');

      expect(service.findAll).toHaveBeenCalledWith('appreciation', 'public');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findReceived', () => {
    it('should return received feedback', async () => {
      const expectedResult = [
        { id: 'feedback-1', content: 'Feedback 1' },
        { id: 'feedback-2', content: 'Feedback 2' },
      ];

      mockFeedbackService.findReceived.mockResolvedValue(expectedResult);

      const result = await controller.findReceived(mockRequest, true);

      expect(service.findReceived).toHaveBeenCalledWith(mockRequest.user.id, true);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findGiven', () => {
    it('should return given feedback', async () => {
      const expectedResult = [
        { id: 'feedback-1', content: 'Feedback 1' },
        { id: 'feedback-2', content: 'Feedback 2' },
      ];

      mockFeedbackService.findGiven.mockResolvedValue(expectedResult);

      const result = await controller.findGiven(mockRequest);

      expect(service.findGiven).toHaveBeenCalledWith(mockRequest.user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getThread', () => {
    it('should return a feedback thread', async () => {
      const feedbackId = 'feedback-123';
      const expectedResult = {
        id: feedbackId,
        content: 'Root feedback',
        replies: [
          { id: 'reply-1', content: 'Reply 1' },
          { id: 'reply-2', content: 'Reply 2' },
        ],
      };

      mockFeedbackService.getThread.mockResolvedValue(expectedResult);

      const result = await controller.getThread(feedbackId);

      expect(service.getThread).toHaveBeenCalledWith(feedbackId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('reply', () => {
    it('should reply to feedback', async () => {
      const feedbackId = 'feedback-123';
      const replyDto: CreateFeedbackDto = {
        content: 'Thank you for the feedback!',
        receiver_id: 'user-456',
        feedback_type: 'general',
        visibility: 'public',
      };

      const expectedResult = {
        id: 'reply-123',
        ...replyDto,
        giver: { id: mockRequest.user.id },
        receiver: { id: replyDto.receiver_id },
        parent_feedback: { id: feedbackId },
        created_at: new Date(),
      };

      mockFeedbackService.reply.mockResolvedValue(expectedResult);

      const result = await controller.reply(feedbackId, replyDto, mockRequest);

      expect(service.reply).toHaveBeenCalledWith(feedbackId, replyDto, mockRequest.user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAnalytics', () => {
    it('should return feedback analytics', async () => {
      const analyticsDto: FeedbackAnalyticsDto = {
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        type: 'frequency',
      };

      const expectedResult = {
        frequency_data: {
          '2023-01': 5,
          '2023-02': 8,
        },
        group_by: 'month',
        total_count: 13,
      };

      mockFeedbackService.getAnalytics.mockResolvedValue(expectedResult);

      const result = await controller.getAnalytics(analyticsDto);

      expect(service.getAnalytics).toHaveBeenCalledWith(analyticsDto, 'system');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a feedback by id', async () => {
      const feedbackId = 'feedback-123';
      const expectedResult = { id: feedbackId, content: 'Feedback content' };

      mockFeedbackService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(feedbackId);

      expect(service.findOne).toHaveBeenCalledWith(feedbackId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update feedback', async () => {
      const feedbackId = 'feedback-123';
      const updateFeedbackDto: UpdateFeedbackDto = { content: 'Updated content' };
      const expectedResult = { id: feedbackId, content: 'Updated content' };

      mockFeedbackService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(feedbackId, updateFeedbackDto);

      expect(service.update).toHaveBeenCalledWith(feedbackId, updateFeedbackDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove feedback', async () => {
      const feedbackId = 'feedback-123';
      const expectedResult = { id: feedbackId };

      mockFeedbackService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(feedbackId, mockRequest);

      expect(service.remove).toHaveBeenCalledWith(feedbackId, mockRequest.user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('markRead', () => {
    it('should mark feedback as read', async () => {
      const feedbackId = 'feedback-123';
      const expectedResult = { id: feedbackId, read_at: new Date() };

      mockFeedbackService.markRead.mockResolvedValue(expectedResult);

      const result = await controller.markRead(feedbackId, mockRequest);

      expect(service.markRead).toHaveBeenCalledWith(feedbackId, mockRequest.user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('acknowledge', () => {
    it('should acknowledge feedback', async () => {
      const feedbackId = 'feedback-123';
      const expectedResult = { id: feedbackId, acknowledged_at: new Date() };

      mockFeedbackService.acknowledge.mockResolvedValue(expectedResult);

      const result = await controller.acknowledge(feedbackId, mockRequest);

      expect(service.acknowledge).toHaveBeenCalledWith(feedbackId, mockRequest.user.id);
      expect(result).toEqual(expectedResult);
    });
  });
}); 