const { Client } = require('pg');

async function checkGratificationsDB() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'supersecretpassword',
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // 1. Verificar tabla gratifications
    console.log('\n🔍 TABLA GRATIFICATIONS:');
    const gratifications = await client.query('SELECT id, name, type, min_level FROM gratifications ORDER BY type, id LIMIT 20');
    console.table(gratifications.rows);

    // 2. Verificar tabla weapons
    console.log('\n🔍 TABLA WEAPONS:');
    const weapons = await client.query('SELECT id, name FROM weapons ORDER BY id LIMIT 10');
    console.table(weapons.rows);

    // 3. Verificar tabla skills
    console.log('\n🔍 TABLA SKILLS:');
    const skills = await client.query('SELECT id, name FROM skills ORDER BY id LIMIT 10');
    console.table(skills.rows);

    // 4. Verificar tabla stat_boost_possibilities
    console.log('\n🔍 TABLA STAT_BOOST_POSSIBILITIES:');
    const statBoosts = await client.query('SELECT id, hp, strength, resistance, speed, intelligence, min_level FROM stat_boost_possibilities ORDER BY id LIMIT 10');
    console.table(statBoosts.rows);

    // 5. Verificar inconsistencias - Gratifications de tipo weapon que no existen en weapons
    console.log('\n❌ GRATIFICATIONS DE TIPO WEAPON QUE NO EXISTEN EN TABLA WEAPONS:');
    const weaponInconsistencies = await client.query(`
      SELECT g.id, g.name, g.type 
      FROM gratifications g 
      WHERE g.type = 'weapon' 
      AND g.id NOT IN (SELECT id FROM weapons)
      ORDER BY g.id
    `);
    console.table(weaponInconsistencies.rows);

    // 6. Verificar inconsistencias - Gratifications de tipo skill que no existen en skills
    console.log('\n❌ GRATIFICATIONS DE TIPO SKILL QUE NO EXISTEN EN TABLA SKILLS:');
    const skillInconsistencies = await client.query(`
      SELECT g.id, g.name, g.type 
      FROM gratifications g 
      WHERE g.type = 'skill' 
      AND g.id NOT IN (SELECT id FROM skills)
      ORDER BY g.id
    `);
    console.table(skillInconsistencies.rows);

    // 7. Contar total de gratifications por tipo
    console.log('\n📊 RESUMEN GRATIFICATIONS POR TIPO:');
    const summary = await client.query(`
      SELECT type, COUNT(*) as total 
      FROM gratifications 
      GROUP BY type 
      ORDER BY type
    `);
    console.table(summary.rows);

    // 8. Verificar si existe tabla bruto_config
    console.log('\n🔍 TABLA BRUTO_CONFIG:');
    try {
      const config = await client.query('SELECT * FROM bruto_config LIMIT 1');
      console.table(config.rows);
    } catch (error) {
      console.log('❌ Tabla bruto_config no existe o está vacía');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

checkGratificationsDB();
