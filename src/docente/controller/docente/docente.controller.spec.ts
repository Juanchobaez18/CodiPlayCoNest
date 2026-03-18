import { Test, TestingModule } from '@nestjs/testing';
import { DocenteController } from './docente.controller';

describe('DocenteController', () => {
  let controller: DocenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocenteController],
    }).compile();

    controller = module.get<DocenteController>(DocenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
