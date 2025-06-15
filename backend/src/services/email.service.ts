import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Mailjet = require('node-mailjet');

@Injectable()
export class EmailService {
  private mailjet: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('email.mailjet.apiKey');
    const apiSecret = this.configService.get('email.mailjet.apiSecret');
    
    if (!apiKey || !apiSecret) {
      console.warn('Mailjet API credentials not configured. Email functionality will be disabled.');
      this.mailjet = null;
    } else {
      this.mailjet = Mailjet.apiConnect(apiKey, apiSecret);
    }
  }

  async sendEmail(
    to: { email: string; name?: string }[],
    subject: string,
    textContent: string,
    htmlContent?: string,
  ) {
    if (!this.mailjet) {
      console.log('Email service not configured. Would send email:', {
        to: to.map(r => r.email),
        subject,
        textContent: textContent.substring(0, 100) + '...'
      });
      return { Messages: [{ Status: 'skipped - no email config' }] };
    }

    try {
      const response = await this.mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: this.configService.get('email.from') || 'noreply@example.com',
              Name: this.configService.get('email.fromName') || 'Performance Review Platform',
            },
            To: to.map(recipient => ({
              Email: recipient.email,
              Name: recipient.name || recipient.email,
            })),
            Subject: subject,
            TextPart: textContent,
            HTMLPart: htmlContent || textContent,
          },
        ],
      });

      return response.body;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(to: { email: string; name?: string }) {
    const subject = 'Welcome to Performance Review Platform';
    const textContent = `
      Welcome to the Performance Review Platform!
      
      We're excited to have you on board. Our platform helps you track your performance, set goals, and receive feedback.
      
      Get started by:
      1. Completing your profile
      2. Setting your first OKRs
      3. Exploring the dashboard
      
      If you have any questions, feel free to reach out to our support team.
      
      Best regards,
      The Performance Review Team
    `;

    const htmlContent = `
      <h2>Welcome to the Performance Review Platform!</h2>
      
      <p>We're excited to have you on board. Our platform helps you track your performance, set goals, and receive feedback.</p>
      
      <h3>Get started by:</h3>
      <ol>
        <li>Completing your profile</li>
        <li>Setting your first OKRs</li>
        <li>Exploring the dashboard</li>
      </ol>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
      
      <p>Best regards,<br>The Performance Review Team</p>
    `;

    return this.sendEmail([to], subject, textContent, htmlContent);
  }

  async sendReviewNotification(
    to: { email: string; name?: string },
    reviewType: string,
    dueDate: Date,
  ) {
    const subject = `New ${reviewType} Review Required`;
    const textContent = `
      You have a new ${reviewType} review to complete.
      
      Due Date: ${dueDate.toLocaleDateString()}
      
      Please log in to the platform to complete your review.
      
      Best regards,
      The Performance Review Team
    `;

    const htmlContent = `
      <h2>New ${reviewType} Review Required</h2>
      
      <p>You have a new ${reviewType} review to complete.</p>
      
      <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
      
      <p>Please log in to the platform to complete your review.</p>
      
      <p>Best regards,<br>The Performance Review Team</p>
    `;

    return this.sendEmail([to], subject, textContent, htmlContent);
  }

  async sendFeedbackNotification(
    to: { email: string; name?: string },
    fromName: string,
  ) {
    const subject = 'New Feedback Received';
    const textContent = `
      You have received new feedback from ${fromName}.
      
      Log in to the platform to view the feedback and respond if needed.
      
      Best regards,
      The Performance Review Team
    `;

    const htmlContent = `
      <h2>New Feedback Received</h2>
      
      <p>You have received new feedback from <strong>${fromName}</strong>.</p>
      
      <p>Log in to the platform to view the feedback and respond if needed.</p>
      
      <p>Best regards,<br>The Performance Review Team</p>
    `;

    return this.sendEmail([to], subject, textContent, htmlContent);
  }

  async sendFeedbackRequest(data: any) {
    const { to, requesterName, context } = data;
    const subject = 'Feedback Request';
    const textContent = `
      ${requesterName} has requested feedback from you.
      
      Context: ${context || 'General feedback'}
      
      Please log in to the platform to provide your feedback.
      
      Best regards,
      The Performance Review Team
    `;

    const htmlContent = `
      <h2>Feedback Request</h2>
      
      <p><strong>${requesterName}</strong> has requested feedback from you.</p>
      
      <p><strong>Context:</strong> ${context || 'General feedback'}</p>
      
      <p>Please log in to the platform to provide your feedback.</p>
      
      <p>Best regards,<br>The Performance Review Team</p>
    `;

    return this.sendEmail([to], subject, textContent, htmlContent);
  }

  async sendReviewReminder(data: any) {
    const { to, reviewType, dueDate } = data;
    const subject = `Reminder: ${reviewType} Review Due Soon`;
    const textContent = `
      This is a reminder that your ${reviewType} review is due soon.
      
      Due Date: ${new Date(dueDate).toLocaleDateString()}
      
      Please complete your review as soon as possible.
      
      Best regards,
      The Performance Review Team
    `;

    const htmlContent = `
      <h2>Reminder: ${reviewType} Review Due Soon</h2>
      
      <p>This is a reminder that your <strong>${reviewType}</strong> review is due soon.</p>
      
      <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
      
      <p>Please complete your review as soon as possible.</p>
      
      <p>Best regards,<br>The Performance Review Team</p>
    `;

    return this.sendEmail([to], subject, textContent, htmlContent);
  }

  async sendInvitationEmail(data: {
    to: { email: string; name: string };
    organizationName: string;
    role: string;
    jobTitle?: string;
    tempPassword: string;
    loginUrl: string;
  }) {
    const { to, organizationName, role, jobTitle, tempPassword, loginUrl } = data;
    const subject = `Welcome to ${organizationName} - Your Account Details`;
    
    const textContent = `
      Welcome to ${organizationName}!
      
      Hello ${to.name},
      
      You have been invited to join ${organizationName} on our performance management platform.
      
      Your Account Details:
      Email: ${to.email}
      Temporary Password: ${tempPassword}
      Role: ${role}
      ${jobTitle ? `Job Title: ${jobTitle}` : ''}
      
      Please log in using the credentials above and change your password immediately.
      
      Login URL: ${loginUrl}
      
      If you have any questions, please contact your administrator.
      
      Best regards,
      The PerformAI Platform Team
    `;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3b82f6; margin: 0;">Welcome to ${organizationName}!</h1>
        </div>
        
        <p style="font-size: 16px; color: #374151;">Hello <strong>${to.name}</strong>,</p>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          You have been invited to join <strong>${organizationName}</strong> on our performance management platform.
        </p>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
          <h3 style="color: #1f2937; margin-top: 0;">Your Account Details:</h3>
          <p style="margin: 8px 0; color: #374151;"><strong>Email:</strong> ${to.email}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
          <p style="margin: 8px 0; color: #374151;"><strong>Role:</strong> ${role}</p>
          ${jobTitle ? `<p style="margin: 8px 0; color: #374151;"><strong>Job Title:</strong> ${jobTitle}</p>` : ''}
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-weight: 600;">
            ⚠️ Important: Please log in and change your password immediately for security.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" 
             style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
            Login to Platform
          </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
          If you have any questions, please contact your administrator or reply to this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #6b7280; text-align: center;">
          Best regards,<br>
          <strong>The PerformAI Platform Team</strong>
        </p>
      </div>
    `;

    return this.sendEmail([to], subject, textContent, htmlContent);
  }
} 