import { Test, TestingModule } from '@nestjs/testing';
import { DocenteService } from './docente.service';

describe('DocenteService', () => {
  let service: DocenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocenteService],
    }).compile();

    service = module.get<DocenteService>(DocenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
