// Script to run the new simplified stat boost migrations
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function runNewMigrations() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    console.log('🔄 Running new simplified stat boost migrations...\n');
    
    // Step 1: Recreate the table with new structure
    const recreateTableSQL = fs.readFileSync(
      path.join(__dirname, 'src/migrations/RecreateStatBoostPossibilitiesTable.sql'), 
      'utf8'
    );
    
    db.exec(recreateTableSQL, (err) => {
      if (err) {
        console.error('❌ Error recreating stat_boost_possibilities table:', err);
        reject(err);
        return;
      }
      
      console.log('✅ Recreated stat_boost_possibilities table with new structure');
      
      // Step 2: Populate with new data
      const populateSQL = fs.readFileSync(
        path.join(__dirname, 'src/migrations/PopulateNewStatBoosts.sql'), 
        'utf8'
      );
      
      db.exec(populateSQL, (err) => {
        if (err) {
          console.error('❌ Error populating stat_boost_possibilities table:', err);
          reject(err);
          return;
        }
        
        console.log('✅ Populated stat_boost_possibilities table with new data');
        
        // Step 3: Verify the data
        db.all(`
          SELECT 
            COUNT(*) as total_count,
            MIN(min_level) as min_level,
            MAX(min_level) as max_level,
            COUNT(CASE WHEN hp > 0 THEN 1 END) as hp_boosts,
            COUNT(CASE WHEN strength > 0 THEN 1 END) as strength_boosts,
            COUNT(CASE WHEN resistance > 0 THEN 1 END) as resistance_boosts,
            COUNT(CASE WHEN speed > 0 THEN 1 END) as speed_boosts,
            COUNT(CASE WHEN intelligence > 0 THEN 1 END) as intelligence_boosts
          FROM stat_boost_possibilities
        `, (err, rows) => {
          if (err) {
            console.error('❌ Error verifying data:', err);
            reject(err);
            return;
          }
          
          const stats = rows[0];
          console.log('\n📊 Migration Results:');
          console.log('============================');
          console.log(`Total stat combinations: ${stats.total_count}`);
          console.log(`Level range: ${stats.min_level} - ${stats.max_level}`);
          console.log(`HP boosts: ${stats.hp_boosts}`);
          console.log(`Strength boosts: ${stats.strength_boosts}`);
          console.log(`Resistance boosts: ${stats.resistance_boosts}`);
          console.log(`Speed boosts: ${stats.speed_boosts}`);
          console.log(`Intelligence boosts: ${stats.intelligence_boosts}`);
          
          // Show some examples
          db.all(`
            SELECT hp, strength, resistance, speed, intelligence, min_level
            FROM stat_boost_possibilities 
            ORDER BY min_level, id
            LIMIT 10
          `, (err, examples) => {
            if (err) {
              console.error('❌ Error getting examples:', err);
              reject(err);
              return;
            }
            
            console.log('\n📋 Example Stat Combinations:');
            console.log('=====================================');
            examples.forEach((example, index) => {
              const stats = [];
              if (example.hp > 0) stats.push(`HP +${example.hp}`);
              if (example.strength > 0) stats.push(`STR +${example.strength}`);
              if (example.resistance > 0) stats.push(`RES +${example.resistance}`);
              if (example.speed > 0) stats.push(`SPD +${example.speed}`);
              if (example.intelligence > 0) stats.push(`INT +${example.intelligence}`);
              
              console.log(`${index + 1}. Level ${example.min_level}+: ${stats.join(', ')}`);
            });
            
            db.close();
            console.log('\n🎉 New migration completed successfully!');
            resolve();
          });
        });
      });
    });
  });
}

// Run the migrations
runNewMigrations().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
