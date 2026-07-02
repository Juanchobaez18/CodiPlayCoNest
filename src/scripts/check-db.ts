import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Estudiante } from '../estudiantes/entities/estudiantes.entity';
import { Curso } from '../curso/entity/curso.entity/curso.entity';
import { TareaEntrega } from '../docente/entities/tarea-entrega.entity';
import { Tarea } from '../docente/entities/tarea.entity';

async function bootstrap() {
  console.log('--- INSPECCIÓN DE BASE DE DATOS ---');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const estudianteRepo = dataSource.getRepository(Estudiante);
  const cursoRepo = dataSource.getRepository(Curso);
  const entregaRepo = dataSource.getRepository(TareaEntrega);
  const tareaRepo = dataSource.getRepository(Tarea);

  console.log('\n--- ESTUDIANTES ---');
  const estudiantes = await estudianteRepo.find({
    relations: ['user', 'cursos', 'leccionesCompletadas', 'leccionesCompletadas.modulo'],
  });
  for (const est of estudiantes) {
    console.log(`Estudiante ID: ${est.id}, Nombre: ${est.user?.name} ${est.user?.lastName}, Email: ${est.user?.email}`);
    console.log(`  - Progreso Global: ${est.progreso}%`);
    console.log(`  - Cursos Matriculados: ${est.cursos?.map(c => c.nombre).join(', ') || 'Ninguno'}`);
    console.log(`  - Lecciones Completadas: ${est.leccionesCompletadas?.length || 0}`);
  }

  console.log('\n--- TAREAS ---');
  const tareas = await tareaRepo.find({
    relations: ['curso', 'modulo', 'leccion'],
  });
  console.log(`Total tareas en DB: ${tareas.length}`);
  for (const t of tareas) {
    console.log(`Tarea ID: ${t.id}, Título: ${t.titulo}, Curso: ${t.curso?.nombre}, Estado: ${t.estado}`);
  }

  console.log('\n--- ENTREGAS ---');
  const entregas = await entregaRepo.find({
    relations: ['tarea', 'estudiante', 'estudiante.user'],
  });
  console.log(`Total entregas en DB: ${entregas.length}`);
  for (const e of entregas) {
    console.log(`Entrega ID: ${e.id}, Estudiante: ${e.estudiante?.user?.name}, Tarea: ${e.tarea?.titulo}, Estado: ${e.estado}, Resultado: ${e.resultado}`);
  }

  await app.close();
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
