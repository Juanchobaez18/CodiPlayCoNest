import { Test, TestingModule } from '@nestjs/testing';
import { MensajesService } from './mensajes.service';

describe('MensajesService', () => {
  let service: MensajesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MensajesService],
    }).compile();

    service = module.get<MensajesService>(MensajesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
