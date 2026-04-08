import { Test, TestingModule } from '@nestjs/testing';
import { LeccionesController } from './lecciones.controller';

describe('LeccionesController', () => {
  let controller: LeccionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeccionesController],
    }).compile();

    controller = module.get<LeccionesController>(LeccionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
