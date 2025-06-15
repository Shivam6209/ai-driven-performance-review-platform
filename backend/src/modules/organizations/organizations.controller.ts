import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService, CreateOrganizationDto } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create organization' })
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user organization' })
  getCurrentOrganization(@Request() req: any) {
    return this.organizationsService.findOne(req.user.organizationId);
  }

  @Get('current/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current organization statistics' })
  getCurrentOrganizationStats(@Request() req: any) {
    return this.organizationsService.getOrganizationStats(req.user.organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations' })
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user organization' })
  updateCurrent(@Request() req: any, @Body() updateData: Partial<CreateOrganizationDto>) {
    return this.organizationsService.update(req.user.organizationId, updateData);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization' })
  update(@Param('id') id: string, @Body() updateData: Partial<CreateOrganizationDto>) {
    return this.organizationsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization' })
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
} 