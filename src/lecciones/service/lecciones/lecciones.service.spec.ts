import { Test, TestingModule } from '@nestjs/testing';
import { LeccionesService } from './lecciones.service';

describe('LeccionesService', () => {
  let service: LeccionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeccionesService],
    }).compile();

    service = module.get<LeccionesService>(LeccionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
