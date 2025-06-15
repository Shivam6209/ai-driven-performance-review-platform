import { PartialType } from '@nestjs/mapped-types';
import { CreateOkrCategoryDto } from './create-okr-category.dto';

export class UpdateOkrCategoryDto extends PartialType(CreateOkrCategoryDto) {} 