import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Public } from '../auth/decorators/public.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Dashboard service is healthy' })
  async healthCheck() {
    return {
      status: 'ok',
      service: 'dashboard',
      timestamp: new Date().toISOString(),
      message: 'Dashboard service is running'
    };
  }

  @Get('health/firebase')
  @Public()
  @ApiOperation({ summary: 'Firebase authentication health check' })
  @ApiResponse({ status: 200, description: 'Firebase is properly configured' })
  async getFirebaseHealth() {
    const admin = require('firebase-admin');
    
    try {
      // Check if Firebase Admin is initialized
      if (!admin.apps.length) {
        return {
          status: 'error',
          service: 'Firebase Admin SDK',
          message: 'Firebase Admin SDK not initialized',
          timestamp: new Date().toISOString(),
          configured: false
        };
      }

      // Test Firebase Auth service
      const auth = admin.auth();
      
      // Try to verify a dummy token (this will fail but confirms the service is working)
      try {
        await auth.verifyIdToken('dummy-token');
      } catch (error: any) {
        if (error.code === 'auth/argument-error') {
          return {
            status: 'ok',
            service: 'Firebase Admin SDK',
            message: 'Firebase authentication is properly configured and responding',
            timestamp: new Date().toISOString(),
            configured: true,
            projectId: admin.app().options.projectId
          };
        }
      }

      return {
        status: 'warning',
        service: 'Firebase Admin SDK',
        message: 'Firebase is initialized but response is unexpected',
        timestamp: new Date().toISOString(),
        configured: true
      };

    } catch (error: any) {
      return {
        status: 'error',
        service: 'Firebase Admin SDK',
        message: `Firebase error: ${error.message}`,
        timestamp: new Date().toISOString(),
        configured: false
      };
    }
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard data for current user' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboardData(@Request() req: any) {
    return this.dashboardService.getDashboardData(req.user.userId);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  async getStats(@Request() req: any) {
    return this.dashboardService.getStats(req.user.userId);
  }

  @Get('activities')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent activities' })
  @ApiResponse({ status: 200, description: 'Recent activities retrieved successfully' })
  async getRecentActivities(
    @Request() req: any,
    @Query('limit') limit: number = 10,
  ) {
    return this.dashboardService.getRecentActivities(req.user.userId, limit);
  }

  @Get('performance-overview')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get performance overview' })
  @ApiResponse({ status: 200, description: 'Performance overview retrieved successfully' })
  async getPerformanceOverview(@Request() req: any) {
    return this.dashboardService.getPerformanceOverview(req.user.userId);
  }
} 