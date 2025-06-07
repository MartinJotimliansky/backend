// Script para revisar duplicados en el historial de combates
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

console.log('🔍 Checking battle duplicates in database:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    return;
  }
  
  console.log('✅ Database connection successful');
  
  // Primero, veamos qué tablas de batalla existen
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%battle%' OR name LIKE '%fight%'", (err, tables) => {
    if (err) {
      console.error('❌ Error checking tables:', err);
      return;
    }
    
    console.log('📋 Battle-related tables found:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
    // Revisar la tabla de batallas principal
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND (name='battles' OR name='fights' OR name='battle_results')", (err, battleTables) => {
      if (err) {
        console.error('❌ Error checking battle tables:', err);
        return;
      }
      
      if (battleTables.length === 0) {
        console.log('⚠️  No battle tables found');
        db.close();
        return;
      }
      
      const tableName = battleTables[0].name;
      console.log(`\n🎯 Analyzing table: ${tableName}`);
      
      // Obtener estructura de la tabla
      db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
        if (err) {
          console.error('❌ Error getting table structure:', err);
          return;
        }
        
        console.log('\n📊 Table structure:');
        columns.forEach(col => {
          console.log(`  - ${col.name} (${col.type})`);
        });
        
        // Contar total de registros
        db.get(`SELECT COUNT(*) as total FROM ${tableName}`, (err, result) => {
          if (err) {
            console.error('❌ Error counting records:', err);
            return;
          }
          
          console.log(`\n📈 Total battle records: ${result.total}`);
          
          // Buscar duplicados potenciales basados en timestamp y participantes
          const duplicateQuery = `
            SELECT 
              created_at,
              attacker_id,
              defender_id,
              COUNT(*) as duplicate_count
            FROM ${tableName}
            GROUP BY created_at, attacker_id, defender_id
            HAVING COUNT(*) > 1
            ORDER BY duplicate_count DESC
          `;
          
          db.all(duplicateQuery, (err, duplicates) => {
            if (err) {
              console.error('❌ Error finding duplicates:', err);
              return;
            }
            
            if (duplicates.length > 0) {
              console.log(`\n🚨 Found ${duplicates.length} potential duplicate groups:`);
              duplicates.forEach((dup, index) => {
                console.log(`  ${index + 1}. ${dup.duplicate_count} battles between Brute ${dup.attacker_id} vs ${dup.defender_id} at ${dup.created_at}`);
              });
              
              // Mostrar los primeros registros duplicados en detalle
              if (duplicates.length > 0) {
                const firstDup = duplicates[0];
                const detailQuery = `
                  SELECT * FROM ${tableName}
                  WHERE created_at = ? AND attacker_id = ? AND defender_id = ?
                  ORDER BY id
                `;
                
                db.all(detailQuery, [firstDup.created_at, firstDup.attacker_id, firstDup.defender_id], (err, details) => {
                  if (err) {
                    console.error('❌ Error getting duplicate details:', err);
                    return;
                  }
                  
                  console.log('\n🔍 Details of first duplicate group:');
                  details.forEach((record, index) => {
                    console.log(`  Record ${index + 1}:`, JSON.stringify(record, null, 2));
                  });
                  
                  checkRecentBattles();
                });
              }
            } else {
              console.log('\n✅ No duplicate battles found based on timestamp and participants');
              checkRecentBattles();
            }
          });
        });
      });
      
      function checkRecentBattles() {
        // Revisar las últimas 10 batallas para ver patrones
        db.all(`SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT 10`, (err, recent) => {
          if (err) {
            console.error('❌ Error getting recent battles:', err);
            return;
          }
          
          console.log('\n🕒 Last 10 battles:');
          recent.forEach((battle, index) => {
            console.log(`  ${index + 1}. ID:${battle.id} - Brute ${battle.attacker_id} vs ${battle.defender_id} - ${battle.created_at} - Winner: ${battle.winner_id}`);
          });
          
          // Buscar duplicados en las últimas batallas
          const recentDuplicates = [];
          for (let i = 0; i < recent.length; i++) {
            for (let j = i + 1; j < recent.length; j++) {
              if (recent[i].attacker_id === recent[j].attacker_id && 
                  recent[i].defender_id === recent[j].defender_id &&
                  recent[i].winner_id === recent[j].winner_id) {
                recentDuplicates.push({ battle1: recent[i], battle2: recent[j] });
              }
            }
          }
          
          if (recentDuplicates.length > 0) {
            console.log('\n🚨 DUPLICATES FOUND in recent battles:');
            recentDuplicates.forEach((dup, index) => {
              console.log(`  Duplicate ${index + 1}:`);
              console.log(`    Battle 1: ID ${dup.battle1.id} at ${dup.battle1.created_at}`);
              console.log(`    Battle 2: ID ${dup.battle2.id} at ${dup.battle2.created_at}`);
              console.log(`    Same result: Brute ${dup.battle1.attacker_id} vs ${dup.battle1.defender_id}, winner: ${dup.battle1.winner_id}`);
            });
          } else {
            console.log('\n✅ No duplicates found in recent battles');
          }
          
          db.close();
          console.log('\n🔚 Analysis complete');
        });
      }
    });
  });
});
