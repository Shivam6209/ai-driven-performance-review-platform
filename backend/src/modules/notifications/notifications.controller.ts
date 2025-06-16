import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(@Request() req: any, @Query('limit') limit?: string) {
    const userId = req.user.sub;
    const notificationLimit = limit ? parseInt(limit, 10) : 50;
    
    return this.notificationsService.getUserNotifications(userId, notificationLimit);
  }

  @Post(':notificationId/read')
  async markAsRead(@Request() req: any, @Param('notificationId') notificationId: string) {
    const userId = req.user.sub;
    
    return this.notificationsService.markNotificationAsRead(userId, notificationId);
  }

  @Post('clear')
  async clearNotifications(@Request() req: any) {
    const userId = req.user.sub;
    
    return this.notificationsService.clearUserNotifications(userId);
  }
} 