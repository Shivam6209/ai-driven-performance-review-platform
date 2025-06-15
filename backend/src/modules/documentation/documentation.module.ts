import { Module } from '@nestjs/common';
import { DocumentationService } from './documentation.service';
import { DocumentationController } from './documentation.controller';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [RbacModule],
  providers: [DocumentationService],
  controllers: [DocumentationController],
  exports: [DocumentationService],
})
export class DocumentationModule {} 