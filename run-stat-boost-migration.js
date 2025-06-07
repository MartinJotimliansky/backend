// Migration script to create and populate stat boost possibilities table
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

async function runMigrations() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    
    console.log('🔄 Running stat boost possibilities migrations...\n');
    
    // Step 1: Create the table
    const createTableSQL = fs.readFileSync(
      path.join(__dirname, 'src/migrations/CreateStatBoostPossibilitiesTable.sql'), 
      'utf8'
    );
    
    db.exec(createTableSQL, (err) => {
      if (err) {
        console.error('❌ Error creating stat_boost_possibilities table:', err);
        reject(err);
        return;
      }
      
      console.log('✅ Created stat_boost_possibilities table');
      
      // Step 2: Populate the table
      const populateSQL = fs.readFileSync(
        path.join(__dirname, 'src/migrations/PopulateStatBoostPossibilities.sql'), 
        'utf8'
      );
      
      db.exec(populateSQL, (err) => {
        if (err) {
          console.error('❌ Error populating stat_boost_possibilities table:', err);
          reject(err);
          return;
        }
        
        console.log('✅ Populated stat_boost_possibilities table');
        
        // Step 3: Verify the data
        db.all(`
          SELECT 
            COUNT(*) as total_count,
            COUNT(CASE WHEN stats_count = 2 THEN 1 END) as two_stats,
            COUNT(CASE WHEN stats_count = 3 THEN 1 END) as three_stats,
            COUNT(CASE WHEN stats_count = 4 THEN 1 END) as four_stats
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
          console.log(`Total possibilities: ${stats.total_count}`);
          console.log(`2-stat combinations: ${stats.two_stats} (for levels 1-9)`);
          console.log(`3-stat combinations: ${stats.three_stats} (for levels 10-19)`);
          console.log(`4-stat combinations: ${stats.four_stats} (for levels 20+)`);
          
          db.close();
          console.log('\n🎉 Migration completed successfully!');
          resolve();
        });
      });
    });
  });
}

// Run the migrations
runMigrations().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
