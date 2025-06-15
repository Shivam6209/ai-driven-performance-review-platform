import { EmailService } from './email.service';
import { ApiService } from './api';

jest.mock('./api');

describe('EmailService', () => {
  let service: EmailService;
  let mockApiService: jest.Mocked<ApiService>;

  beforeEach(() => {
    mockApiService = {
      getInstance: jest.fn().mockReturnThis(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ApiService>;

    (ApiService.getInstance as jest.Mock).mockReturnValue(mockApiService);
    service = EmailService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendReviewNotification', () => {
    const mockReviewData = {
      employeeId: 'emp1',
      employeeName: 'John Doe',
      reviewType: 'quarterly',
      dueDate: '2024-03-01',
    };

    it('sends review notification email', async () => {
      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: { messageId: 'msg1' },
      });

      await service.sendReviewNotification(mockReviewData);

      expect(mockApiService.post).toHaveBeenCalledWith('/email/send', {
        to: mockReviewData.employeeId,
        subject: expect.stringContaining('Performance Review'),
        template: 'review_notification',
        data: mockReviewData,
      });
    });

    it('handles API errors', async () => {
      mockApiService.post.mockResolvedValueOnce({
        success: false,
        error: { code: 'ERROR', message: 'Failed to send email' },
      });

      await expect(service.sendReviewNotification(mockReviewData)).rejects.toThrow(
        'Failed to send email'
      );
    });
  });

  describe('sendFeedbackRequest', () => {
    const mockFeedbackData = {
      requesterId: 'emp1',
      requesterName: 'John Doe',
      recipientId: 'emp2',
      recipientName: 'Jane Smith',
      dueDate: '2024-03-01',
    };

    it('sends feedback request email', async () => {
      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: { messageId: 'msg1' },
      });

      await service.sendFeedbackRequest(mockFeedbackData);

      expect(mockApiService.post).toHaveBeenCalledWith('/email/send', {
        to: mockFeedbackData.recipientId,
        subject: expect.stringContaining('Feedback Request'),
        template: 'feedback_request',
        data: mockFeedbackData,
      });
    });
  });

  describe('sendReviewReminder', () => {
    const mockReminderData = {
      employeeId: 'emp1',
      employeeName: 'John Doe',
      reviewType: 'quarterly',
      dueDate: '2024-03-01',
      daysRemaining: 5,
    };

    it('sends review reminder email', async () => {
      mockApiService.post.mockResolvedValueOnce({
        success: true,
        data: { messageId: 'msg1' },
      });

      await service.sendReviewReminder(mockReminderData);

      expect(mockApiService.post).toHaveBeenCalledWith('/email/send', {
        to: mockReminderData.employeeId,
        subject: expect.stringContaining('Review Reminder'),
        template: 'review_reminder',
        data: mockReminderData,
      });
    });
  });
}); 
 