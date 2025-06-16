import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { OkrService } from './okr.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { CreateOkrCategoryDto } from './dto/create-okr-category.dto';
import { UpdateOkrCategoryDto } from './dto/update-okr-category.dto';
import { CreateOkrUpdateDto } from './dto/create-okr-update.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('okr')
export class OkrController {
  constructor(private readonly okrService: OkrService) {}

  // Objective endpoints
  @Post('objectives')
  // No authentication guard - PUBLIC ROUTE
  createObjective(@Body() createObjectiveDto: CreateObjectiveDto, @Request() req: any) {
    // For public route, we need to handle missing user data
    const userId = req.user?.id || 'anonymous';
    const organizationId = req.user?.organizationId || 'default';
    return this.okrService.createObjective(createObjectiveDto, userId, organizationId);
  }

  @Get('objectives')
  @UseGuards(JwtAuthGuard)
  findAllObjectives(@Query() query: any, @Request() req: any) {
    return this.okrService.findAllObjectives(req.user.id, req.user.organizationId, query);
  }

  @Get('objectives/:id')
  @UseGuards(JwtAuthGuard)
  findObjectiveById(@Param('id') id: string, @Request() req: any) {
    return this.okrService.findObjectiveById(id, req.user.id, req.user.organizationId);
  }

  @Patch('objectives/:id')
  @UseGuards(JwtAuthGuard)
  updateObjective(@Param('id') id: string, @Body() updateObjectiveDto: UpdateObjectiveDto, @Request() req: any) {
    return this.okrService.updateObjective(id, updateObjectiveDto, req.user.id, req.user.organizationId);
  }

  @Delete('objectives/:id')
  @UseGuards(JwtAuthGuard)
  removeObjective(@Param('id') id: string, @Request() req: any) {
    return this.okrService.removeObjective(id, req.user.id, req.user.organizationId);
  }

  @Get('objectives/:id/alignment')
  @UseGuards(JwtAuthGuard)
  getAlignmentData(@Param('id') id: string) {
    return this.okrService.getAlignmentData(id);
  }

  // Key Result endpoints
  @Post('key-results')
  @UseGuards(JwtAuthGuard)
  createKeyResult(@Body() createKeyResultDto: CreateKeyResultDto) {
    return this.okrService.createKeyResult(createKeyResultDto);
  }

  @Get('objectives/:objectiveId/key-results')
  @UseGuards(JwtAuthGuard)
  findAllKeyResults(@Param('objectiveId') objectiveId: string) {
    return this.okrService.findAllKeyResults(objectiveId);
  }

  @Get('key-results/:id')
  @UseGuards(JwtAuthGuard)
  findKeyResultById(@Param('id') id: string) {
    return this.okrService.findKeyResultById(id);
  }

  @Patch('key-results/:id')
  @UseGuards(JwtAuthGuard)
  updateKeyResult(@Param('id') id: string, @Body() updateKeyResultDto: UpdateKeyResultDto) {
    return this.okrService.updateKeyResult(id, updateKeyResultDto);
  }

  @Delete('key-results/:id')
  @UseGuards(JwtAuthGuard)
  removeKeyResult(@Param('id') id: string) {
    return this.okrService.removeKeyResult(id);
  }

  // OKR Update endpoints
  @Post('updates')
  @UseGuards(JwtAuthGuard)
  createUpdate(@Body() createOkrUpdateDto: CreateOkrUpdateDto) {
    return this.okrService.createUpdate(createOkrUpdateDto);
  }

  @Get('key-results/:keyResultId/updates')
  @UseGuards(JwtAuthGuard)
  getUpdatesForKeyResult(@Param('keyResultId') keyResultId: string) {
    return this.okrService.getUpdatesForKeyResult(keyResultId);
  }

  // OKR Category endpoints
  @Post('categories')
  @UseGuards(JwtAuthGuard)
  createCategory(@Body() createOkrCategoryDto: CreateOkrCategoryDto) {
    return this.okrService.createCategory(createOkrCategoryDto);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  findAllCategories() {
    return this.okrService.findAllCategories();
  }

  @Get('categories/:id')
  @UseGuards(JwtAuthGuard)
  findCategoryById(@Param('id') id: string) {
    return this.okrService.findCategoryById(id);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  updateCategory(@Param('id') id: string, @Body() updateOkrCategoryDto: UpdateOkrCategoryDto) {
    return this.okrService.updateCategory(id, updateOkrCategoryDto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  removeCategory(@Param('id') id: string) {
    return this.okrService.removeCategory(id);
  }

  // Team Progress
  @Get('team-progress/:managerId')
  @UseGuards(JwtAuthGuard)
  getTeamProgress(@Param('managerId') managerId: string) {
    return this.okrService.getTeamProgress(managerId);
  }
} 