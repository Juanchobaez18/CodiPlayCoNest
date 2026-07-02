import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Estudiante } from '../estudiantes/entities/estudiantes.entity';
import { Curso } from '../curso/entity/curso.entity/curso.entity';

async function bootstrap() {
  console.log('Iniciando matrícula del estudiante...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const estudianteRepo = dataSource.getRepository(Estudiante);
  const cursoRepo = dataSource.getRepository(Curso);

  // Buscar el estudiante
  const estudiante = await estudianteRepo.findOne({
    where: { user: { email: 'student_test_123@gmail.com' } },
    relations: ['cursos'],
  });

  if (!estudiante) {
    console.error('❌ Estudiante student_test_123@gmail.com no encontrado.');
    await app.close();
    return;
  }

  // Buscar todos los cursos
  const cursos = await cursoRepo.find();
  if (cursos.length === 0) {
    console.error('❌ No hay cursos en la base de datos.');
    await app.close();
    return;
  }

  // Matricular en todos los cursos
  estudiante.cursos = cursos;
  await estudianteRepo.save(estudiante);

  console.log(`✅ Estudiante ${estudiante.id} matriculado con éxito en ${cursos.length} cursos.`);
  for (const c of cursos) {
    console.log(`   - Curso: ${c.nombre} (ID: ${c.id})`);
  }

  await app.close();
}

bootstrap().catch(err => {
  console.error('Error matriculando estudiante:', err);
  process.exit(1);
});
