import { Test, TestingModule } from '@nestjs/testing';
import { ModulosService } from './modulos.service';

describe('ModulosService', () => {
  let service: ModulosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModulosService],
    }).compile();

    service = module.get<ModulosService>(ModulosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
