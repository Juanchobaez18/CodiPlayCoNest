const { Client } = require('pg');

async function sync() {
  const client = new Client({ connectionString: 'postgresql://root:123456@localhost:5432/auth_db' });
  await client.connect();
  try {
    const entregas = await client.query('SELECT e.estudiante_id, t.leccion_id FROM tarea_entregas e JOIN tareas t ON e.tarea_id = t.id WHERE e.resultado = \'APROBADO\'');
    console.log(`Found ${entregas.rows.length} approved tasks.`);
    for (const row of entregas.rows) {
      try {
        await client.query(
          'INSERT INTO estudiante_lecciones_completadas_lecciones ("estudianteId", "leccionesId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [row.estudiante_id, row.leccion_id]
        );
        console.log(`Synced student ${row.estudianteId} lesson ${row.leccionId}`);
      } catch (e) {
        console.error(`Error inserting relation: ${e.message}`);
      }
    }
  } catch (e) {
    console.error(`Error querying: ${e.message}`);
  } finally {
    await client.end();
  }
}

sync();
