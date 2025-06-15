import { Controller, Get, Post, Body, Param, UseGuards, Request, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvitationsService, CreateInvitationDto } from './invitations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all invitations for current user organization' })
  async findAll(@Request() req: any) {
    return this.invitationsService.findByOrganization(req.user.organizationId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send invitation to join organization' })
  async create(@Body() createInvitationDto: CreateInvitationDto, @Request() req: any) {
    // Use current user's organization and ID
    const invitationData = {
      ...createInvitationDto,
      organizationId: req.user.organizationId,
      invitedBy: req.user.userId,
    };
    
    return this.invitationsService.create(invitationData);
  }

  @Put(':id/resend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend invitation' })
  async resend(@Param('id') id: string) {
    return this.invitationsService.resendInvitation(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel invitation' })
  async cancel(@Param('id') id: string) {
    await this.invitationsService.cancelInvitation(id);
    return { message: 'Invitation cancelled successfully' };
  }

  @Get('token/:token')
  @Public()
  @ApiOperation({ summary: 'Get invitation by token' })
  findByToken(@Param('token') token: string) {
    return this.invitationsService.findByToken(token);
  }

  @Post('accept/:token')
  @Public()
  @ApiOperation({ summary: 'Accept invitation' })
  acceptInvitation(@Param('token') token: string) {
    return this.invitationsService.acceptInvitation(token);
  }

  @Get('organization/:organizationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all invitations for organization' })
  findByOrganization(@Param('organizationId') organizationId: string, @Request() req: any) {
    // Ensure user can only see invitations for their own organization
    if (req.user.organizationId !== organizationId) {
      throw new Error('Unauthorized');
    }
    
    return this.invitationsService.findByOrganization(organizationId);
  }
} 