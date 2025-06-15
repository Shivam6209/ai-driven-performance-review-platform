import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiGeneration } from './entities/ai-generation.entity';
import { EmployeesService } from '../employees/employees.service';
import { FeedbackService } from '../feedback/feedback.service';
import { OkrService } from '../okr/okr.service';
import { EmbeddingService } from './embedding.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: getRepositoryToken(AiGeneration),
          useValue: {},
        },
        {
          provide: EmployeesService,
          useValue: {},
        },
        {
          provide: FeedbackService,
          useValue: {},
        },
        {
          provide: OkrService,
          useValue: {},
        },
        {
          provide: EmbeddingService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
}); 