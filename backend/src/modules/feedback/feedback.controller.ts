import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,

  Request,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackAnalyticsDto } from './dto/feedback-analytics.dto';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('feedback')
@ApiBearerAuth()
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Create new feedback' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully' })
  create(@Body() createFeedbackDto: CreateFeedbackDto, @Request() req: any) {
    return this.feedbackService.create(createFeedbackDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feedback' })
  findAll(@Query('type') type?: string, @Query('visibility') visibility?: string) {
    return this.feedbackService.findAll(type, visibility);
  }

  @Get('received')
  @ApiOperation({ summary: 'Get feedback received by current user' })
  findReceived(@Request() req: any, @Query('read') read?: boolean) {
    return this.feedbackService.findReceived(req.user.userId, read);
  }

  @Get('given')
  @ApiOperation({ summary: 'Get feedback given by current user' })
  findGiven(@Request() req: any) {
    return this.feedbackService.findGiven(req.user.userId);
  }

  @Get('thread/:id')
  @ApiOperation({ summary: 'Get a feedback thread' })
  getThread(@Param('id') id: string) {
    return this.feedbackService.getThread(id);
  }

  @Post('reply/:id')
  @ApiOperation({ summary: 'Reply to feedback' })
  reply(
    @Param('id') id: string,
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Request() req: any,
  ) {
    return this.feedbackService.reply(id, createFeedbackDto, req.user.userId);
  }

  @Post('analytics')
  @RequirePermissions('feedback', 'analytics')
  async getAnalytics(
    @Body() analyticsDto: FeedbackAnalyticsDto,
  ) {
    // For now, we'll use a default user ID or get it from JWT context
    return this.feedbackService.getAnalytics(analyticsDto, 'system');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feedback by ID' })
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update feedback' })
  update(
    @Param('id') id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.update(id, updateFeedbackDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete feedback' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.feedbackService.remove(id, req.user.userId);
  }

  @Post(':id/mark-read')
  @ApiOperation({ summary: 'Mark feedback as read' })
  markRead(@Param('id') id: string, @Request() req: any) {
    return this.feedbackService.markRead(id, req.user.userId);
  }

  @Post(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge feedback' })
  acknowledge(@Param('id') id: string, @Request() req: any) {
    return this.feedbackService.acknowledge(id, req.user.userId);
  }
} 