import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

// Removed unused interface

interface ReviewNotificationData {
  employeeId: string;
  employeeName: string;
  reviewType: string;
  dueDate: string;
}

interface FeedbackRequestData {
  requesterId: string;
  requesterName: string;
  recipientId: string;
  recipientName: string;
  dueDate: string;
}

interface ReviewReminderData {
  employeeId: string;
  employeeName: string;
  reviewType: string;
  dueDate: string;
  daysRemaining: number;
}

describe('EmailService', () => {
  let service: EmailService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: { [key: string]: string } = {
        'email.mailjet.apiKey': 'test-api-key',
        'email.mailjet.apiSecret': 'test-api-secret',
        'email.from': 'test@example.com',
        'email.fromName': 'Test Platform',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      const to = [{ email: 'recipient@example.com', name: 'Test Recipient' }];
      const subject = 'Test Subject';
      const textContent = 'Test Content';
      const htmlContent = '<p>Test Content</p>';

      // Mock the Mailjet post request
      const mockMailjetResponse = {
        body: {
          Messages: [{ Status: 'success' }],
        },
      };

      jest.spyOn(service['mailjet'], 'post').mockReturnValue({
        request: jest.fn().mockResolvedValue(mockMailjetResponse),
      } as any);

      const result = await service.sendEmail(to, subject, textContent, htmlContent);

      expect(result).toEqual(mockMailjetResponse.body);
      expect(service['mailjet'].post).toHaveBeenCalledWith('send', { version: 'v3.1' });
    });

    it('should handle errors when sending email fails', async () => {
      const to = [{ email: 'recipient@example.com' }];
      const subject = 'Test Subject';
      const textContent = 'Test Content';

      // Mock the Mailjet post request to throw an error
      jest.spyOn(service['mailjet'], 'post').mockReturnValue({
        request: jest.fn().mockRejectedValue(new Error('Failed to send')),
      } as any);

      await expect(service.sendEmail(to, subject, textContent)).rejects.toThrow('Failed to send email');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send a welcome email', async () => {
      const to = { email: 'new-user@example.com', name: 'New User' };
      
      jest.spyOn(service, 'sendEmail').mockResolvedValue({ Messages: [{ Status: 'success' }] });

      await service.sendWelcomeEmail(to);

      expect(service.sendEmail).toHaveBeenCalledWith(
        [to],
        'Welcome to Performance Review Platform',
        expect.stringContaining('Welcome to the Performance Review Platform!'),
        expect.stringContaining('<h2>Welcome to the Performance Review Platform!</h2>'),
      );
    });
  });

  describe('sendReviewNotification', () => {
    const mockReviewData: ReviewNotificationData = {
      employeeId: 'emp1',
      employeeName: 'John Doe',
      reviewType: 'quarterly',
      dueDate: '2024-03-01',
    };

    it('sends review notification email', async () => {
      const to = { email: 'john@example.com', name: mockReviewData.employeeName };
      const dueDate = new Date(mockReviewData.dueDate);
      
      jest.spyOn(service, 'sendEmail').mockResolvedValue({ Messages: [{ Status: 'success' }] });

      await service.sendReviewNotification(to, mockReviewData.reviewType, dueDate);

      expect(service.sendEmail).toHaveBeenCalledWith(
        [to],
        expect.stringContaining('Review Required'),
        expect.stringContaining(mockReviewData.reviewType),
        expect.stringContaining('<h2>New'),
      );
    });

    it('handles mailer errors', async () => {
      const to = { email: 'john@example.com', name: mockReviewData.employeeName };
      const dueDate = new Date(mockReviewData.dueDate);
      
      jest.spyOn(service, 'sendEmail').mockRejectedValue(new Error('Failed to send email'));

      await expect(service.sendReviewNotification(to, mockReviewData.reviewType, dueDate)).rejects.toThrow(
        'Failed to send email'
      );
    });
  });

  describe('sendFeedbackNotification', () => {
    it('should send a feedback notification', async () => {
      const to = { email: 'employee@example.com', name: 'Employee' };
      const fromName = 'Manager';

      jest.spyOn(service, 'sendEmail').mockResolvedValue({ Messages: [{ Status: 'success' }] });

      await service.sendFeedbackNotification(to, fromName);

      expect(service.sendEmail).toHaveBeenCalledWith(
        [to],
        'New Feedback Received',
        expect.stringContaining('You have received new feedback from Manager'),
        expect.stringContaining('<h2>New Feedback Received</h2>'),
      );
    });
  });

  describe('sendFeedbackRequest', () => {
    const mockFeedbackData: FeedbackRequestData = {
      requesterId: 'emp1',
      requesterName: 'John Doe',
      recipientId: 'emp2',
      recipientName: 'Jane Smith',
      dueDate: '2024-03-01',
    };

    it('sends feedback request email', async () => {
      // Mock the sendEmail method since sendFeedbackRequest uses it internally
      jest.spyOn(service, 'sendEmail').mockResolvedValue({ Messages: [{ Status: 'success' }] });

      await service.sendFeedbackRequest(mockFeedbackData);

      expect(service.sendEmail).toHaveBeenCalled();
    });
  });

  describe('sendReviewReminder', () => {
    const mockReminderData: ReviewReminderData = {
      employeeId: 'emp1',
      employeeName: 'John Doe',
      reviewType: 'quarterly',
      dueDate: '2024-03-01',
      daysRemaining: 5,
    };

    it('sends review reminder email', async () => {
      // Mock the sendEmail method since sendReviewReminder uses it internally
      jest.spyOn(service, 'sendEmail').mockResolvedValue({ Messages: [{ Status: 'success' }] });

      await service.sendReviewReminder(mockReminderData);

      expect(service.sendEmail).toHaveBeenCalled();
    });
  });
}); 