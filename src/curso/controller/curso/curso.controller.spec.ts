import { Test, TestingModule } from '@nestjs/testing';
import { CursoController } from './curso.controller';

describe('CursoController', () => {
  let controller: CursoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CursoController],
    }).compile();

    controller = module.get<CursoController>(CursoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
