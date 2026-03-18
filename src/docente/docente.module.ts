import { Module } from '@nestjs/common';
import { DocenteService } from './service/docente/docente.service';
import { DocenteController } from './controller/docente/docente.controller';
import { Docente } from './entities/docente.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [DocenteService],
  controllers: [DocenteController],
  imports: [
    TypeOrmModule.forFeature([Docente])
  ],

})
export class DocenteModule {}
