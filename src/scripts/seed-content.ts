/**
 * Siembra el contenido del curso HTML/CSS en la base de datos.
 * Busca el primer curso que contenga "html" en su nombre y le agrega
 * Módulo 1 (9 lecciones HTML) y Módulo 2 (5 lecciones CSS) si no existen.
 *
 * Ejecutar con:
 *   npm run seed:content
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Curso } from '../curso/entity/curso.entity/curso.entity';
import { Modulos } from '../modulos/entities/modulos.entity';
import { Lecciones } from '../lecciones/entities/lecciones.entity';

const MODULO1_LECCIONES: { titulo: string; descripcion: string; orden: string }[] = [
  {
    titulo: '¿Qué es Internet y las Páginas Web?',
    descripcion: 'Explicación con dibujos y ejemplos de qué es una página web y cómo funciona Internet. Dibujar cómo se imagina su propia web.',
    orden: '1',
  },
  {
    titulo: 'Introducción a HTML',
    descripcion: 'Explicar qué es HTML, para qué sirve y crear su primera estructura básica. Escribir una página con su nombre.',
    orden: '2',
  },
  {
    titulo: 'Etiquetas de Título y Texto',
    descripcion: 'Aprender etiquetas básicas de HTML: h1–h3 y p. Crear una hoja con 3 títulos y 3 párrafos.',
    orden: '3',
  },
  {
    titulo: 'Agregar Imágenes con HTML',
    descripcion: 'Etiqueta img, rutas de imagen. Colocar 3 imágenes favoritas.',
    orden: '4',
  },
  {
    titulo: 'Listas en HTML',
    descripcion: 'Listas ordenadas y desordenadas (ul, ol, li). Crear lista de juguetes o películas favoritas.',
    orden: '5',
  },
  {
    titulo: 'Enlaces y Navegación',
    descripcion: 'Etiqueta a y href para crear enlaces. Crear un menú con enlaces ficticios.',
    orden: '6',
  },
  {
    titulo: 'Tablas Básicas',
    descripcion: 'Crear tablas sencillas con table, tr, td. Crear una tabla de calificaciones ficticias.',
    orden: '7',
  },
  {
    titulo: 'Formularios Simples',
    descripcion: 'Etiquetas input, label, button. Crear un formulario con nombre y edad.',
    orden: '8',
  },
  {
    titulo: 'Proyecto Mini Página Personal',
    descripcion: 'Integrar imágenes, texto y enlaces en una sola página. Personalizar su página.',
    orden: '9',
  },
];

const MODULO2_LECCIONES: { titulo: string; descripcion: string; orden: string }[] = [
  {
    titulo: 'Introducción a CSS',
    descripcion: 'Qué es CSS, para qué sirve y cómo conectarlo al HTML. Sintaxis básica: selectores, propiedades y valores.',
    orden: '1',
  },
  {
    titulo: 'Colores y Fondos CSS',
    descripcion: 'Aplicar colores de texto, fondo e imágenes de fondo. Degradados con linear-gradient y radial-gradient.',
    orden: '2',
  },
  {
    titulo: 'Tamaño y Tipo de Letra',
    descripcion: 'Controlar fuentes con font-size, font-family, font-weight. Importar fuentes desde Google Fonts.',
    orden: '3',
  },
  {
    titulo: 'Bordes y Márgenes',
    descripcion: 'El modelo de caja CSS: margin, padding, border y border-radius. Centrar elementos.',
    orden: '4',
  },
  {
    titulo: 'Decorar Listas y Tablas con CSS',
    descripcion: 'Dar estilo profesional a listas (list-style, hover) y tablas (border-collapse, zebra striping).',
    orden: '5',
  },
];

async function bootstrap() {
  console.log('🌱 Iniciando seed de contenido del curso...\n');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const cursoRepo = dataSource.getRepository(Curso);
  const modulosRepo = dataSource.getRepository(Modulos);
  const leccionesRepo = dataSource.getRepository(Lecciones);

  // ── 1. Buscar curso HTML ───────────────────────────────────────
  const todosLosCursos = await cursoRepo.find();
  const curso =
    todosLosCursos.find((c) =>
      c.nombre.toLowerCase().includes('html'),
    ) ??
    todosLosCursos.find((c) =>
      c.nombre.toLowerCase().includes('web'),
    ) ??
    todosLosCursos[0] ??
    null;

  if (!curso) {
    console.error(
      '❌ No se encontró ningún curso en la base de datos.\n' +
      '   Crea el curso desde el panel de administración (Swagger) y vuelve a ejecutar este script.\n' +
      '   POST /cursos  →  { "nombre": "Desarrollo Web con HTML y CSS", "descripcion": "...", "dificultad": "básico", "precio": 50000, "docenteId": 1 }',
    );
    await app.close();
    return;
  }

  console.log(`✅ Curso encontrado: "${curso.nombre}" (ID: ${curso.id})\n`);

  // ── 2. Módulo 1 (HTML) ─────────────────────────────────────────
  let modulo1 = await modulosRepo.findOne({
    where: { orden: 1, curso: { id: curso.id } },
    relations: ['curso', 'lecciones'],
  });

  if (!modulo1) {
    modulo1 = modulosRepo.create({
      titulo: 'Módulo 1 - HTML',
      descripcion:
        'Plan de Clases: HTML desde cero. Aprende a estructurar páginas web con los fundamentos del lenguaje HTML.',
      orden: 1,
      completado: false,
      curso,
    });
    await modulosRepo.save(modulo1);
    console.log('✅ Módulo 1 (HTML) creado');
  } else {
    console.log(`✅ Módulo 1 (HTML) ya existe (ID: ${modulo1.id})`);
  }

  for (const lecData of MODULO1_LECCIONES) {
    const existe = await leccionesRepo.findOne({
      where: { orden: lecData.orden, modulo: { id: modulo1.id } },
      relations: ['modulo'],
    });
    if (!existe) {
      const lec = leccionesRepo.create({ ...lecData, contenido: '', modulo: modulo1 });
      await leccionesRepo.save(lec);
      console.log(`   ✅ Lección ${lecData.orden}: ${lecData.titulo}`);
    } else {
      console.log(`   ⏭️  Lección ${lecData.orden} ya existe, omitiendo.`);
    }
  }

  // ── 3. Módulo 2 (CSS) ──────────────────────────────────────────
  let modulo2 = await modulosRepo.findOne({
    where: { orden: 2, curso: { id: curso.id } },
    relations: ['curso', 'lecciones'],
  });

  if (!modulo2) {
    modulo2 = modulosRepo.create({
      titulo: 'Módulo 2 - CSS',
      descripcion:
        'Aprende a dar estilos y colores a tus páginas HTML usando CSS. Convierte páginas simples en diseños atractivos.',
      orden: 2,
      completado: false,
      curso,
    });
    await modulosRepo.save(modulo2);
    console.log('\n✅ Módulo 2 (CSS) creado');
  } else {
    console.log(`\n✅ Módulo 2 (CSS) ya existe (ID: ${modulo2.id})`);
  }

  for (const lecData of MODULO2_LECCIONES) {
    const existe = await leccionesRepo.findOne({
      where: { orden: lecData.orden, modulo: { id: modulo2.id } },
      relations: ['modulo'],
    });
    if (!existe) {
      const lec = leccionesRepo.create({ ...lecData, contenido: '', modulo: modulo2 });
      await leccionesRepo.save(lec);
      console.log(`   ✅ Lección ${lecData.orden}: ${lecData.titulo}`);
    } else {
      console.log(`   ⏭️  Lección ${lecData.orden} ya existe, omitiendo.`);
    }
  }

  console.log('\n🎉 ¡Contenido sembrado exitosamente!');
  console.log('   Ahora ve al panel del estudiante → Mis Cursos → Ver módulos para verificar.');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Error ejecutando seed-content:', err);
  process.exit(1);
});
