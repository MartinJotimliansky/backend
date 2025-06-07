// Script para limpiar batallas duplicadas en PostgreSQL
const { Client } = require('pg');

// Configuración de conexión a PostgreSQL
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Stinkistinki33_',
  database: 'postgres'
});

async function cleanDuplicateBattles() {
  try {
    await client.connect();
    console.log('🔗 Conectado a PostgreSQL');

    // 1. Encontrar duplicados
    console.log('\n🔍 Buscando batallas duplicadas...');
    const duplicateQuery = `
      SELECT 
        "bruteAttackerId",
        "bruteDefenderId", 
        "winnerBruteId",
        created_at,
        COUNT(*) as duplicate_count,
        ARRAY_AGG(id ORDER BY id) as battle_ids
      FROM battles 
      GROUP BY "bruteAttackerId", "bruteDefenderId", "winnerBruteId", created_at
      HAVING COUNT(*) > 1
      ORDER BY duplicate_count DESC;
    `;

    const duplicates = await client.query(duplicateQuery);
    
    if (duplicates.rows.length === 0) {
      console.log('✅ No se encontraron batallas duplicadas');
      return;
    }

    console.log(`🚨 Encontradas ${duplicates.rows.length} grupos de batallas duplicadas:`);
    
    let totalDuplicates = 0;
    duplicates.rows.forEach((row, index) => {
      const extraDuplicates = row.duplicate_count - 1;
      totalDuplicates += extraDuplicates;
      console.log(`  ${index + 1}. Atacante ${row.bruteAttackerId} vs Defensor ${row.bruteDefenderId}`);
      console.log(`     Ganador: ${row.winnerBruteId}, Duplicados: ${row.duplicate_count}`);
      console.log(`     IDs: [${row.battle_ids.join(', ')}]`);
    });

    console.log(`\n📊 Total de batallas duplicadas a eliminar: ${totalDuplicates}`);

    // 2. Eliminar duplicados (mantener solo el primero de cada grupo)
    console.log('\n🧹 Eliminando duplicados...');
    
    let deletedCount = 0;
    
    for (const row of duplicates.rows) {
      const battleIds = row.battle_ids;
      const idsToDelete = battleIds.slice(1); // Mantener el primero, eliminar el resto
      
      if (idsToDelete.length > 0) {
        // Primero eliminar los logs de batalla
        const deleteLogsQuery = `DELETE FROM battle_logs WHERE battle_id = ANY($1)`;
        await client.query(deleteLogsQuery, [idsToDelete]);
        
        // Luego eliminar las batallas
        const deleteBattlesQuery = `DELETE FROM battles WHERE id = ANY($1)`;
        const result = await client.query(deleteBattlesQuery, [idsToDelete]);
        
        deletedCount += result.rowCount;
        console.log(`  ✅ Eliminadas ${result.rowCount} batallas duplicadas para el grupo ${row.bruteAttackerId} vs ${row.bruteDefenderId}`);
      }
    }

    console.log(`\n🎉 Proceso completado. Total de batallas duplicadas eliminadas: ${deletedCount}`);

    // 3. Verificar que no quedan duplicados
    console.log('\n🔄 Verificando limpieza...');
    const verifyQuery = `
      SELECT COUNT(*) as remaining_duplicates
      FROM (
        SELECT "bruteAttackerId", "bruteDefenderId", "winnerBruteId", created_at, COUNT(*) as cnt
        FROM battles 
        GROUP BY "bruteAttackerId", "bruteDefenderId", "winnerBruteId", created_at
        HAVING COUNT(*) > 1
      ) duplicates;
    `;
    
    const verification = await client.query(verifyQuery);
    const remainingDuplicates = verification.rows[0].remaining_duplicates;
    
    if (remainingDuplicates === '0') {
      console.log('✅ Limpieza exitosa. No quedan batallas duplicadas.');
    } else {
      console.log(`⚠️  Aún quedan ${remainingDuplicates} grupos de duplicados.`);
    }

    // 4. Mostrar estadísticas finales
    const statsQuery = `SELECT COUNT(*) as total_battles FROM battles`;
    const stats = await client.query(statsQuery);
    console.log(`\n📈 Total de batallas en la base de datos: ${stats.rows[0].total_battles}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔚 Conexión cerrada');
  }
}

// Ejecutar el script
cleanDuplicateBattles();
