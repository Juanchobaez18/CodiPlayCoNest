import { Test, TestingModule } from '@nestjs/testing';
import { CursoService } from './curso.service';

describe('CursoService', () => {
  let service: CursoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CursoService],
    }).compile();

    service = module.get<CursoService>(CursoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
