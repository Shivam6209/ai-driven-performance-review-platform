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
@UseGuards(JwtAuthGuard)
export class OkrController {
  constructor(private readonly okrService: OkrService) {}

  // Objective endpoints
  @Post('objectives')
  createObjective(@Body() createObjectiveDto: CreateObjectiveDto) {
    return this.okrService.createObjective(createObjectiveDto);
  }

  @Get('objectives')
  findAllObjectives(@Query() query: any) {
    return this.okrService.findAllObjectives(query);
  }

  @Get('objectives/:id')
  findObjectiveById(@Param('id') id: string) {
    return this.okrService.findObjectiveById(id);
  }

  @Patch('objectives/:id')
  updateObjective(
    @Param('id') id: string,
    @Body() updateObjectiveDto: UpdateObjectiveDto,
  ) {
    return this.okrService.updateObjective(id, updateObjectiveDto);
  }

  @Delete('objectives/:id')
  removeObjective(@Param('id') id: string) {
    return this.okrService.removeObjective(id);
  }

  @Get('objectives/:id/alignment')
  getAlignmentData(@Param('id') id: string) {
    return this.okrService.getAlignmentData(id);
  }

  // Key Result endpoints
  @Post('key-results')
  createKeyResult(@Body() createKeyResultDto: CreateKeyResultDto) {
    return this.okrService.createKeyResult(createKeyResultDto);
  }

  @Get('objectives/:objectiveId/key-results')
  findAllKeyResults(@Param('objectiveId') objectiveId: string) {
    return this.okrService.findAllKeyResults(objectiveId);
  }

  @Get('key-results/:id')
  findKeyResultById(@Param('id') id: string) {
    return this.okrService.findKeyResultById(id);
  }

  @Patch('key-results/:id')
  updateKeyResult(
    @Param('id') id: string,
    @Body() updateKeyResultDto: UpdateKeyResultDto,
    @Request() req: any,
  ) {
    if (!updateKeyResultDto.updatedById) {
      updateKeyResultDto.updatedById = req.user.userId;
    }
    return this.okrService.updateKeyResult(id, updateKeyResultDto);
  }

  @Delete('key-results/:id')
  removeKeyResult(@Param('id') id: string) {
    return this.okrService.removeKeyResult(id);
  }

  // OKR Update endpoints
  @Post('updates')
  createUpdate(@Body() createOkrUpdateDto: CreateOkrUpdateDto, @Request() req: any) {
    if (!createOkrUpdateDto.updatedById) {
      createOkrUpdateDto.updatedById = req.user.userId;
    }
    return this.okrService.createUpdate(createOkrUpdateDto);
  }

  @Get('key-results/:keyResultId/updates')
  getUpdatesForKeyResult(@Param('keyResultId') keyResultId: string) {
    return this.okrService.getUpdatesForKeyResult(keyResultId);
  }

  // OKR Category endpoints
  @Post('categories')
  createCategory(@Body() createOkrCategoryDto: CreateOkrCategoryDto) {
    return this.okrService.createCategory(createOkrCategoryDto);
  }

  @Get('categories')
  findAllCategories() {
    return this.okrService.findAllCategories();
  }

  @Get('categories/:id')
  findCategoryById(@Param('id') id: string) {
    return this.okrService.findCategoryById(id);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() updateOkrCategoryDto: UpdateOkrCategoryDto,
  ) {
    return this.okrService.updateCategory(id, updateOkrCategoryDto);
  }

  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.okrService.removeCategory(id);
  }

  // Team Progress
  @Get('team-progress/:managerId')
  getTeamProgress(@Param('managerId') managerId: string) {
    return this.okrService.getTeamProgress(managerId);
  }
} 