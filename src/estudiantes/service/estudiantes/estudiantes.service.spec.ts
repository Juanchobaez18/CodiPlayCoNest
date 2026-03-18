import { Test, TestingModule } from '@nestjs/testing';
import { EstudiantesService } from './estudiantes.service';

describe('EstudiantesService', () => {
  let service: EstudiantesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EstudiantesService],
    }).compile();

    service = module.get<EstudiantesService>(EstudiantesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
