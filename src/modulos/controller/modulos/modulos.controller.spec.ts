import { Test, TestingModule } from '@nestjs/testing';
import { ModulosController } from './modulos.controller';

describe('ModulosController', () => {
  let controller: ModulosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModulosController],
    }).compile();

    controller = module.get<ModulosController>(ModulosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
